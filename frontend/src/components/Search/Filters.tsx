import { useSearchStore } from '../../stores/searchStore'

export function Filters() {
  const { parsedFilters } = useSearchStore()

  if (!parsedFilters) return null

  const activeFilters = []

  if (parsedFilters.bhk) {
    activeFilters.push(`${parsedFilters.bhk} BHK`)
  }
  if (parsedFilters.min_price || parsedFilters.max_price) {
    const priceRange = parsedFilters.min_price && parsedFilters.max_price
      ? `${parsedFilters.min_price}L - ${parsedFilters.max_price}L`
      : parsedFilters.max_price
        ? `Under ${parsedFilters.max_price}L`
        : `Above ${parsedFilters.min_price}L`
    activeFilters.push(priceRange)
  }
  if (parsedFilters.area) {
    activeFilters.push(parsedFilters.area)
  }
  if (parsedFilters.amenities?.length > 0) {
    activeFilters.push(...parsedFilters.amenities)
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      <span className="text-sm text-gray-600">Filters detected:</span>
      {activeFilters.map((filter, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
        >
          {filter}
        </span>
      ))}
    </div>
  )
}
