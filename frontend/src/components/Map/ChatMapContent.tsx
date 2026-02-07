import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import type { Property } from '../../types'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

interface MiniPropertyPopupProps {
  property: Property
  showCompare?: boolean
  onCompare?: (property: Property) => void
  isCompared?: boolean
}

function MiniPropertyPopup({ property, showCompare, onCompare, isCompared }: MiniPropertyPopupProps) {
  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request'
    if (price >= 100) return `${(price / 100).toFixed(2)} Cr`
    return `${price} L`
  }

  return (
    <div className="min-w-[180px] p-1">
      <h3 className="font-semibold text-gray-900 text-sm mb-1">
        {property.title || `${property.bhk} BHK in ${property.area}`}
      </h3>
      <div className="text-xs text-gray-500 mb-1">{property.area}</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-blue-600">
          {formatPrice(property.price_lakhs)}
        </span>
        {showCompare && onCompare && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCompare(property)
            }}
            className={`px-2 py-0.5 text-xs rounded-full font-medium transition-all ${
              isCompared
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {isCompared ? '✓ Added' : '+ Compare'}
          </button>
        )}
      </div>
    </div>
  )
}

function InvalidateSize() {
  const map = useMap()
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 0)
    return () => clearTimeout(timeout)
  }, [map])
  return null
}

interface ChatMapContentProps {
  properties: Property[]
  height: string
  showCompare?: boolean
  onCompare?: (property: Property) => void
  isCompared?: (id: string) => boolean
}

export default function ChatMapContent({
  properties,
  height,
  showCompare,
  onCompare,
  isCompared,
}: ChatMapContentProps) {
  const bounds = L.latLngBounds(
    properties.map((p) => [p.latitude!, p.longitude!] as [number, number])
  )

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [30, 30] }}
      style={{ height, width: '100%' }}
      className="z-0 rounded-lg"
    >
      <InvalidateSize />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {properties.map((property) => (
        <Marker
          key={property.id}
          position={[property.latitude!, property.longitude!]}
        >
          <Popup>
            <MiniPropertyPopup
              property={property}
              showCompare={showCompare}
              onCompare={onCompare}
              isCompared={isCompared?.(property.id)}
            />
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
