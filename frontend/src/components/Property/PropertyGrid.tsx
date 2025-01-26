import { useSearchStore } from '../../stores/searchStore'
import { PropertyCard } from './PropertyCard'
import type { Property } from '../../types'

export function PropertyGrid() {
  const { results, isLoading, error, selectProperty } = useSearchStore()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          No properties found. Try a different search query.
        </p>
      </div>
    )
  }

  const handleSelect = (property: Property) => {
    selectProperty(property)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSelect={handleSelect}
        />
      ))}
    </div>
  )
}
