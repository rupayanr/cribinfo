import { useState } from 'react'
import { useCompare } from '../../hooks/useCompare'
import type { Property } from '../../types'

// Generate a gradient based on property ID for visual distinction
function getGradient(id: string): string {
  const gradients = [
    'from-blue-500 to-purple-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
  ]
  // Use ID hash to pick a gradient
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return gradients[hash % gradients.length]
}

// Calculate star rating based on amenities count (1-5 stars)
function getStarRating(amenitiesCount: number): number {
  if (amenitiesCount >= 10) return 5
  if (amenitiesCount >= 7) return 4
  if (amenitiesCount >= 4) return 3
  if (amenitiesCount >= 2) return 2
  return 1
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" title={`${rating} out of 5 stars based on amenities`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function StatIcon({ type }: { type: 'bed' | 'bath' | 'sqft' | 'rupee' }) {
  switch (type) {
    case 'bed':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'bath':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    case 'sqft':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      )
    case 'rupee':
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}

export function CompareView() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
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

  // Get comparison highlights for a property
  const getHighlights = (property: Property) => {
    const highlights: string[] = []
    if (isBestPrice(property)) highlights.push('Lowest Price')
    if (isBestSize(property)) highlights.push('Largest')
    if (isBestPricePerSqft(property)) highlights.push('Best Value')
    return highlights
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
      <div className="max-w-7xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-gray-100">
              Compare ({compareList.length}/5)
            </h3>
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Table
              </button>
            </div>
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

        {/* Card View */}
        {viewMode === 'cards' && (
          <div className={`overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 transition-all duration-300 ${isExpanded ? 'max-h-[70vh]' : 'max-h-[280px] sm:max-h-[320px]'}`}>
            <div className="flex gap-3 sm:gap-4 pb-2">
              {compareList.map((property) => {
                const highlights = getHighlights(property)
                const starRating = getStarRating(property.amenities.length)

                return (
                  <div
                    key={property.id}
                    className="flex-shrink-0 w-[260px] sm:w-[280px] bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600"
                  >
                    {/* Gradient Header */}
                    <div className={`relative h-20 bg-gradient-to-br ${getGradient(property.id)}`}>
                      <button
                        onClick={() => removeFromCompare(property.id)}
                        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
                        title="Remove from compare"
                      >
                        &times;
                      </button>
                      {/* Highlight Badges */}
                      {highlights.length > 0 && (
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {highlights.map((h) => (
                            <span
                              key={h}
                              className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/90 text-gray-800 font-medium"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Property Info */}
                    <div className="p-3">
                      {/* Title & Area */}
                      <div className="mb-2">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {property.title || property.area || 'Property'}
                        </h4>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {property.area}, {property.city}
                          </p>
                          <StarRating rating={starRating} />
                        </div>
                      </div>

                      {/* Quick Stats Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <StatIcon type="bed" />
                          <span>{property.bhk ? `${property.bhk} BHK` : 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <StatIcon type="bath" />
                          <span>{property.bathrooms || 'N/A'} Bath</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <StatIcon type="sqft" />
                          <span className={isBestSize(property) ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                            {property.sqft ? `${property.sqft.toLocaleString()} sqft` : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                          <StatIcon type="rupee" />
                          <span className={isBestPricePerSqft(property) ? 'text-green-600 dark:text-green-400 font-medium' : ''}>
                            {formatPricePerSqft(property.price_lakhs, property.sqft)}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className={`text-lg font-bold mb-2 ${isBestPrice(property) ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-gray-100'}`}>
                        {formatPrice(property.price_lakhs)}
                      </div>

                      {/* Amenities (collapsed by default, expanded when panel is expanded) */}
                      {isExpanded && property.amenities.length > 0 && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                          <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                            Amenities ({property.amenities.length})
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {property.amenities.slice(0, 6).map((amenity) => (
                              <span
                                key={amenity}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 capitalize"
                              >
                                {amenity}
                              </span>
                            ))}
                            {property.amenities.length > 6 && (
                              <span className="text-[10px] px-1.5 py-0.5 text-gray-500 dark:text-gray-400">
                                +{property.amenities.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location Link */}
                      {isExpanded && property.latitude && property.longitude && (
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                          <a
                            href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            View on Map
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Table View (Original) */}
        {viewMode === 'table' && (
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

                {/* Star Rating */}
                <tr>
                  <td className="py-2 pr-2 sm:pr-4 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">Rating</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-2 px-2 sm:px-4">
                      <StarRating rating={getStarRating(p.amenities.length)} />
                    </td>
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
        )}

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
