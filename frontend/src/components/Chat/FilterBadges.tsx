import type { ParsedFilters } from '../../types'

interface FilterBadgesProps {
  filters: ParsedFilters
}

export function FilterBadges({ filters }: FilterBadgesProps) {
  const badges: string[] = []

  if (filters.bhk) {
    badges.push(`${filters.bhk} BHK`)
  }
  if (filters.min_price && filters.max_price) {
    badges.push(`${filters.min_price}L - ${filters.max_price}L`)
  } else if (filters.min_price) {
    badges.push(`Min ${filters.min_price}L`)
  } else if (filters.max_price) {
    badges.push(`Under ${filters.max_price}L`)
  }
  if (filters.min_sqft && filters.max_sqft) {
    badges.push(`${filters.min_sqft} - ${filters.max_sqft} sqft`)
  } else if (filters.min_sqft) {
    badges.push(`Min ${filters.min_sqft} sqft`)
  } else if (filters.max_sqft) {
    badges.push(`Under ${filters.max_sqft} sqft`)
  }
  if (filters.area) {
    badges.push(filters.area)
  }
  if (filters.amenities && filters.amenities.length > 0) {
    badges.push(...filters.amenities)
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {badges.map((badge, index) => (
        <span
          key={index}
          className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium"
        >
          {badge}
        </span>
      ))}
    </div>
  )
}
