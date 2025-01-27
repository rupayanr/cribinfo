import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterBadges } from './FilterBadges'
import type { ParsedFilters } from '../../types'

const mockFilters: ParsedFilters = {
  bhk: 2,
  min_price: null,
  max_price: 100,
  min_sqft: null,
  max_sqft: null,
  area: 'Whitefield',
  amenities: ['gym', 'parking'],
}

describe('FilterBadges', () => {
  it('should render BHK badge', () => {
    render(<FilterBadges filters={mockFilters} />)
    expect(screen.getByText('2 BHK')).toBeInTheDocument()
  })

  it('should render max price badge in Lakhs', () => {
    render(<FilterBadges filters={mockFilters} />)
    expect(screen.getByText('Under 100L')).toBeInTheDocument()
  })

  it('should render area badge', () => {
    render(<FilterBadges filters={mockFilters} />)
    expect(screen.getByText('Whitefield')).toBeInTheDocument()
  })

  it('should render amenity badges', () => {
    render(<FilterBadges filters={mockFilters} />)
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
  })

  it('should render min price badge', () => {
    const filtersWithMinPrice: ParsedFilters = {
      ...mockFilters,
      min_price: 50,
      max_price: null,
    }
    render(<FilterBadges filters={filtersWithMinPrice} />)
    expect(screen.getByText('Min 50L')).toBeInTheDocument()
  })

  it('should render price range badge when both min and max', () => {
    const filtersWithRange: ParsedFilters = {
      ...mockFilters,
      min_price: 50,
      max_price: 100,
    }
    render(<FilterBadges filters={filtersWithRange} />)
    expect(screen.getByText('50L - 100L')).toBeInTheDocument()
  })

  it('should render sqft range badge', () => {
    const filtersWithSqft: ParsedFilters = {
      ...mockFilters,
      min_sqft: 1000,
      max_sqft: 1500,
    }
    render(<FilterBadges filters={filtersWithSqft} />)
    expect(screen.getByText('1000 - 1500 sqft')).toBeInTheDocument()
  })

  it('should render min sqft badge', () => {
    const filtersWithMinSqft: ParsedFilters = {
      ...mockFilters,
      min_sqft: 1000,
    }
    render(<FilterBadges filters={filtersWithMinSqft} />)
    expect(screen.getByText('Min 1000 sqft')).toBeInTheDocument()
  })

  it('should render max sqft badge', () => {
    const filtersWithMaxSqft: ParsedFilters = {
      ...mockFilters,
      max_sqft: 1500,
    }
    render(<FilterBadges filters={filtersWithMaxSqft} />)
    expect(screen.getByText('Under 1500 sqft')).toBeInTheDocument()
  })

  it('should return null for empty filters', () => {
    const minimalFilters: ParsedFilters = {
      bhk: null,
      min_price: null,
      max_price: null,
      min_sqft: null,
      max_sqft: null,
      area: null,
      amenities: [],
    }
    const { container } = render(<FilterBadges filters={minimalFilters} />)
    expect(container.firstChild).toBeNull()
  })

  it('should handle empty amenities array', () => {
    const filtersNoAmenities = { ...mockFilters, amenities: [] }
    render(<FilterBadges filters={filtersNoAmenities} />)
    // Should still render other badges
    expect(screen.getByText('2 BHK')).toBeInTheDocument()
  })
})
