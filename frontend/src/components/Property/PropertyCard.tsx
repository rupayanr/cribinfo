import type { Property } from '../../types'
import { useCompare } from '../../hooks/useCompare'

interface PropertyCardProps {
  property: Property
  onSelect: (property: Property) => void
}

export function PropertyCard({ property, onSelect }: PropertyCardProps) {
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
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 cursor-pointer border border-gray-200 dark:border-gray-700"
      onClick={() => onSelect(property)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-1">
          {property.title || `${property.bhk} BHK in ${property.area}`}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleCompare(property)
          }}
          disabled={!inCompare && !canAddMore}
          className={`px-2 py-1 text-xs rounded ${
            inCompare
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          } disabled:opacity-50`}
        >
          {inCompare ? 'Remove' : 'Compare'}
        </button>
      </div>

      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{property.area}</p>

      <div className="flex flex-wrap gap-4 text-sm mb-3">
        {property.bhk && (
          <span className="text-gray-700 dark:text-gray-300">{property.bhk} BHK</span>
        )}
        {property.sqft && (
          <span className="text-gray-700 dark:text-gray-300">{property.sqft} sqft</span>
        )}
        {property.bathrooms && (
          <span className="text-gray-700 dark:text-gray-300">{property.bathrooms} Bath</span>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
          {formatPrice(property.price_lakhs)}
        </span>
      </div>

      {property.amenities && property.amenities.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {property.amenities.slice(0, 3).map((amenity, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
            >
              {amenity}
            </span>
          ))}
          {property.amenities.length > 3 && (
            <span className="px-2 py-0.5 text-gray-500 dark:text-gray-400 text-xs">
              +{property.amenities.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  )
}
