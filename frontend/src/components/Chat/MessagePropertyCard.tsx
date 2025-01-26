import type { Property } from '../../types'
import { useCompare } from '../../hooks/useCompare'

interface MessagePropertyCardProps {
  property: Property
}

export function MessagePropertyCard({ property }: MessagePropertyCardProps) {
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
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-200 cursor-pointer group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {property.title || `${property.bhk} BHK in ${property.area}`}
          </h4>
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{property.area}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleCompare(property)
          }}
          disabled={!inCompare && !canAddMore}
          className={`px-3 py-1 text-xs rounded-full font-medium flex-shrink-0 ml-2 transition-all duration-200 ${
            inCompare
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {inCompare ? '✓ Added' : '+ Compare'}
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3 py-2 border-y border-gray-100">
        {property.bhk && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">{property.bhk} BHK</span>
          </div>
        )}
        {property.sqft && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <span>{property.sqft} sqft</span>
          </div>
        )}
        {property.bathrooms && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <span>{property.bathrooms} Bath</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {formatPrice(property.price_lakhs)}
        </span>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 rounded-full text-xs border border-gray-200"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="px-2 py-1 text-blue-600 text-xs font-medium">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
