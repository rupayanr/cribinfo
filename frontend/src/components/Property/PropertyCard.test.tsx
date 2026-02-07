import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PropertyCard } from './PropertyCard'
import { useSearchStore } from '../../stores/searchStore'
import type { Property } from '../../types'

const mockProperty: Property = {
  id: '1',
  city: 'bangalore',
  title: 'Luxury Apartment',
  area: 'Koramangala',
  bhk: 3,
  sqft: 1500,
  bathrooms: 2,
  price_lakhs: 150,
  amenities: ['gym', 'pool', 'parking', 'security'],
  latitude: 12.9,
  longitude: 77.6,
}

describe('PropertyCard', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
    useSearchStore.setState({
      compareList: [],
    })
  })

  it('should render property title', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('Luxury Apartment')).toBeInTheDocument()
  })

  it('should render fallback title when title is missing', () => {
    const propertyWithoutTitle = { ...mockProperty, title: null }
    render(<PropertyCard property={propertyWithoutTitle} onSelect={mockOnSelect} />)
    expect(screen.getByText('3 BHK in Koramangala')).toBeInTheDocument()
  })

  it('should render area', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('Koramangala')).toBeInTheDocument()
  })

  it('should render BHK', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('3 BHK')).toBeInTheDocument()
  })

  it('should render sqft', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('1500 sqft')).toBeInTheDocument()
  })

  it('should render bathrooms', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('2 Bath')).toBeInTheDocument()
  })

  it('should format price in Cr for values >= 100L', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('1.50 Cr')).toBeInTheDocument()
  })

  it('should format price in L for values < 100L', () => {
    const cheapProperty = { ...mockProperty, price_lakhs: 85 }
    render(<PropertyCard property={cheapProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('85 L')).toBeInTheDocument()
  })

  it('should show "Price on request" for null price', () => {
    const propertyWithoutPrice = { ...mockProperty, price_lakhs: null }
    render(<PropertyCard property={propertyWithoutPrice} onSelect={mockOnSelect} />)
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })

  it('should render first 3 amenities', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('pool')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
  })

  it('should show +N more for additional amenities', () => {
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('+1 more')).toBeInTheDocument()
  })

  it('should call onSelect when card is clicked', async () => {
    const user = userEvent.setup()
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)

    await user.click(screen.getByText('Luxury Apartment'))

    expect(mockOnSelect).toHaveBeenCalledWith(mockProperty)
  })

  it('should toggle compare when compare button is clicked', async () => {
    const user = userEvent.setup()
    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)

    const compareButton = screen.getByText('Compare')
    await user.click(compareButton)

    expect(useSearchStore.getState().compareList).toHaveLength(1)
  })

  it('should show Remove when property is in compare list', () => {
    useSearchStore.setState({
      compareList: [mockProperty],
    })

    render(<PropertyCard property={mockProperty} onSelect={mockOnSelect} />)
    expect(screen.getByText('Remove')).toBeInTheDocument()
  })

  it('should not render optional fields when missing', () => {
    const minimalProperty: Property = {
      id: '2',
      city: 'bangalore',
      title: 'Basic Flat',
      area: 'Test Area',
      bhk: null,
      sqft: null,
      bathrooms: null,
      price_lakhs: 50,
      amenities: [],
      latitude: null,
      longitude: null,
    }

    render(<PropertyCard property={minimalProperty} onSelect={mockOnSelect} />)
    expect(screen.queryByText(/BHK/)).not.toBeInTheDocument()
    expect(screen.queryByText(/sqft/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Bath/)).not.toBeInTheDocument()
  })
})
