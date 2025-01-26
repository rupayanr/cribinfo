import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useSearchStore } from '../../stores/searchStore'
import type { Property } from '../../types'
import L from 'leaflet'
import { useCompare } from '../../hooks/useCompare'

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

L.Marker.prototype.options.icon = DefaultIcon

const CITY_CENTERS: Record<string, [number, number]> = {
  bangalore: [12.9716, 77.5946],
  mumbai: [19.076, 72.8777],
  delhi: [28.6139, 77.209],
}

function PropertyPopup({ property }: { property: Property }) {
  const { isInCompareList, toggleCompare, canAddMore } = useCompare()
  const inCompare = isInCompareList(property.id)

  const formatPrice = (price: number | null) => {
    if (!price) return 'Price on request'
    if (price >= 100) {
      return `${(price / 100).toFixed(2)} Cr`
    }
    return `${price} L`
  }

  return (
    <div className="min-w-[200px] p-1">
      <h3 className="font-semibold text-gray-900 text-sm mb-1">
        {property.title || `${property.bhk} BHK in ${property.area}`}
      </h3>
      <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        <span>{property.area}</span>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600 mb-2 py-2 border-y border-gray-100">
        {property.bhk && <span className="font-medium">{property.bhk} BHK</span>}
        {property.sqft && <span>{property.sqft} sqft</span>}
        {property.bathrooms && <span>{property.bathrooms} Bath</span>}
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-base font-bold text-blue-600">
          {formatPrice(property.price_lakhs)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleCompare(property)
          }}
          disabled={!inCompare && !canAddMore}
          className={`px-2 py-1 text-xs rounded-full font-medium transition-all ${
            inCompare
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
          } disabled:opacity-50`}
        >
          {inCompare ? '✓ Added' : '+ Compare'}
        </button>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {amenity}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface PropertyMapProps {
  onPropertySelect?: (property: Property) => void
}

export function PropertyMap({ onPropertySelect }: PropertyMapProps) {
  const { results, city, selectProperty } = useSearchStore()

  const propertiesWithCoords = results.filter(
    (p) => p.latitude !== null && p.longitude !== null
  )

  const center = CITY_CENTERS[city] || CITY_CENTERS.bangalore

  const handleSelect = (property: Property) => {
    selectProperty(property)
    onPropertySelect?.(property)
  }

  return (
    <div className="h-full w-full relative">
      {/* Header overlay - centered */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000]">
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg px-4 py-2 border border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">
              {propertiesWithCoords.length} properties on map
            </span>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {propertiesWithCoords.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-900/10 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-sm mx-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No properties to display</h3>
            <p className="text-gray-500 text-sm">Search for properties to see them on the map</p>
          </div>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {propertiesWithCoords.map((property) => (
          <Marker
            key={property.id}
            position={[property.latitude!, property.longitude!]}
            eventHandlers={{
              click: () => handleSelect(property),
            }}
          >
            <Popup className="property-popup">
              <PropertyPopup property={property} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
