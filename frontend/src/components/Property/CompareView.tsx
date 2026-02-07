import { useState } from 'react'
import { useCompare } from '../../hooks/useCompare'
import type { Property } from '../../types'

export function CompareView() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const [isExpanded, setIsExpanded] = useState(false)

  if (compareList.length === 0) return null

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    if (price >= 100) {
      return `${(price / 100).toFixed(2)} Cr`
    }
    return `${price.toFixed(0)} L`
  }

  const formatPricePerSqft = (price: number | null, sqft: number | null) => {
    if (!price || !sqft) return 'N/A'
    const pricePerSqft = (price * 100000) / sqft
    return `${pricePerSqft.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/sqft`
  }

  // Find best values for highlighting
  const prices = compareList.map((p) => p.price_lakhs).filter((p): p is number => p !== null)
  const sizes = compareList.map((p) => p.sqft).filter((s): s is number => s !== null)
  const lowestPrice = prices.length > 0 ? Math.min(...prices) : null
  const largestSize = sizes.length > 0 ? Math.max(...sizes) : null

  const pricesPerSqft = compareList
    .map((p) => (p.price_lakhs && p.sqft ? (p.price_lakhs * 100000) / p.sqft : null))
    .filter((p): p is number => p !== null)
  const lowestPricePerSqft = pricesPerSqft.length > 0 ? Math.min(...pricesPerSqft) : null

  const isBestPrice = (property: Property) => property.price_lakhs === lowestPrice && compareList.length > 1
  const isBestSize = (property: Property) => property.sqft === largestSize && compareList.length > 1
  const isBestPricePerSqft = (property: Property) => {
    if (!property.price_lakhs || !property.sqft || compareList.length <= 1) return false
    const pps = (property.price_lakhs * 100000) / property.sqft
    return Math.abs(pps - (lowestPricePerSqft ?? 0)) < 1
  }

  // Get unique amenities across all properties
  const allAmenities = [...new Set(compareList.flatMap((p) => p.amenities))]

  const hasAmenity = (property: Property, amenity: string) =>
    property.amenities.some((a) => a.toLowerCase() === amenity.toLowerCase())

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
              Compare ({compareList.length}/5)
            </h3>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
          <button
            onClick={clearCompare}
            className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            Clear All
          </button>
        </div>

        {/* Comparison Table */}
        <div className={`overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 transition-all duration-300 ${isExpanded ? 'max-h-[60vh]' : 'max-h-[200px] sm:max-h-[250px]'}`}>
          <table className="w-full text-xs sm:text-sm text-gray-900 dark:text-gray-100">
            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
              <tr className="border-b-2 border-gray-200 dark:border-gray-600">
                <th className="text-left py-2 pr-2 sm:pr-4 whitespace-nowrap font-semibold text-gray-500 dark:text-gray-400 w-24 sm:w-32">Attribute</th>
                {compareList.map((p) => (
                  <th key={p.id} className="text-left py-2 px-2 sm:px-4 min-w-[120px] sm:min-w-[180px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm sm:text-base truncate">{p.title || p.area || 'Property'}</p>
                        {p.title && p.area && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{p.area}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-colors"
                        title="Remove from compare"
                      >
                        &times;
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {/* City */}
              <tr>
                <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">City</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4 capitalize">{p.city || 'N/A'}</td>
                ))}
              </tr>

              {/* BHK */}
              <tr>
                <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">BHK</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4">
                    {p.bhk ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium">
                        {p.bhk} BHK
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr>
                <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Price</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4">
                    <span className={`inline-flex items-center gap-1 ${isBestPrice(p) ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                      {formatPrice(p.price_lakhs)}
                      {isBestPrice(p) && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Best
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Size */}
              <tr>
                <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Size</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4">
                    <span className={`inline-flex items-center gap-1 ${isBestSize(p) ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                      {p.sqft ? `${p.sqft.toLocaleString()} sqft` : 'N/A'}
                      {isBestSize(p) && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Largest
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Price per sqft */}
              <tr>
                <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Price/sqft</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4">
                    <span className={`inline-flex items-center gap-1 ${isBestPricePerSqft(p) ? 'text-green-600 dark:text-green-400 font-semibold' : ''}`}>
                      {formatPricePerSqft(p.price_lakhs, p.sqft)}
                      {isBestPricePerSqft(p) && (
                        <span className="text-[10px] px-1 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                          Best Value
                        </span>
                      )}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Bathrooms */}
              <tr>
                <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Bathrooms</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4">{p.bathrooms || 'N/A'}</td>
                ))}
              </tr>

              {/* Amenities Section */}
              {allAmenities.length > 0 && (
                <>
                  <tr>
                    <td colSpan={compareList.length + 1} className="py-3">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Amenities
                      </span>
                    </td>
                  </tr>
                  {allAmenities.map((amenity) => (
                    <tr key={amenity}>
                      <td className="py-1.5 pr-2 sm:pr-4 text-gray-500 dark:text-gray-400 capitalize whitespace-nowrap text-xs">
                        {amenity}
                      </td>
                      {compareList.map((p) => (
                        <td key={p.id} className="py-1.5 px-2 sm:px-4">
                          {hasAmenity(p, amenity) ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}

              {/* Location */}
              {isExpanded && (
                <tr>
                  <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Location</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-2 px-2 sm:px-4 text-xs text-gray-500 dark:text-gray-400">
                      {p.latitude && p.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${p.latitude},${p.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View on Map
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Tags */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
          {compareList.map((p) => (
            <div
              key={p.id}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px]">
                {p.area || 'Property'}
              </span>
              {p.bhk && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                  {p.bhk}BHK
                </span>
              )}
              {p.price_lakhs && (
                <span className="px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                  {formatPrice(p.price_lakhs)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
