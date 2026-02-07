import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyGrid } from './PropertyGrid'
import { useSearchStore } from '../../stores/searchStore'
import type { Property } from '../../types'

const mockProperties: Property[] = [
  {
    id: '1',
    city: 'bangalore',
    title: 'Luxury Apartment',
    area: 'Koramangala',
    bhk: 3,
    sqft: 1500,
    bathrooms: 2,
    price_lakhs: 150,
    amenities: ['gym'],
    latitude: 12.9,
    longitude: 77.6,
  },
  {
    id: '2',
    city: 'bangalore',
    title: 'Modern Flat',
    area: 'Whitefield',
    bhk: 2,
    sqft: 1200,
    bathrooms: 2,
    price_lakhs: 85,
    amenities: [],
    latitude: 12.9,
    longitude: 77.7,
  },
]

describe('PropertyGrid', () => {
  beforeEach(() => {
    useSearchStore.setState({
      results: [],
      isLoading: false,
      error: null,
      compareList: [],
      selectedProperty: null,
    })
  })

  it('should show loading spinner when isLoading is true', () => {
    useSearchStore.setState({ isLoading: true })
    render(<PropertyGrid />)

    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should show error message when error exists', () => {
    useSearchStore.setState({ error: 'Something went wrong' })
    render(<PropertyGrid />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should show empty message when no results', () => {
    useSearchStore.setState({ results: [] })
    render(<PropertyGrid />)

    expect(screen.getByText(/no properties found/i)).toBeInTheDocument()
  })

  it('should render property cards when results exist', () => {
    useSearchStore.setState({ results: mockProperties })
    render(<PropertyGrid />)

    expect(screen.getByText('Luxury Apartment')).toBeInTheDocument()
    expect(screen.getByText('Modern Flat')).toBeInTheDocument()
  })

  it('should select property when card is clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({ results: mockProperties })
    render(<PropertyGrid />)

    await user.click(screen.getByText('Luxury Apartment'))

    expect(useSearchStore.getState().selectedProperty).toEqual(mockProperties[0])
  })

  it('should render correct number of property cards', () => {
    useSearchStore.setState({ results: mockProperties })
    render(<PropertyGrid />)

    const cards = document.querySelectorAll('.bg-white')
    expect(cards.length).toBe(2)
  })
})
