import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MessagePropertyCard } from './MessagePropertyCard'
import { useSearchStore } from '../../stores/searchStore'
import type { Property } from '../../types'

// Reset store between tests
const resetStore = () => {
  useSearchStore.setState({
    query: '',
    city: '',
    results: [],
    parsedFilters: null,
    isLoading: false,
    error: null,
    selectedProperty: null,
    compareList: [],
    messages: [],
    isTyping: false,
  })
}

const mockProperty: Property = {
  id: 'test-1',
  city: 'bangalore',
  title: 'Beautiful 2BHK Apartment',
  area: 'Whitefield',
  bhk: 2,
  sqft: 1200,
  bathrooms: 2,
  price_lakhs: 85,
  amenities: ['gym', 'parking', 'swimming pool'],
  latitude: 12.9716,
  longitude: 77.5946,
}

describe('MessagePropertyCard', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render property title', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText('Beautiful 2BHK Apartment')).toBeInTheDocument()
  })

  it('should render fallback title when title is null', () => {
    const propertyWithoutTitle = { ...mockProperty, title: null }
    render(<MessagePropertyCard property={propertyWithoutTitle} />)
    expect(screen.getByText(/2 BHK in Whitefield/i)).toBeInTheDocument()
  })

  it('should render area', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText('Whitefield')).toBeInTheDocument()
  })

  it('should render BHK', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText(/2 BHK/i)).toBeInTheDocument()
  })

  it('should render sqft', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText(/1200 sqft/i)).toBeInTheDocument()
  })

  it('should render bathrooms', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText(/2 Bath/i)).toBeInTheDocument()
  })

  it('should render price in Lakhs', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText(/85 L/i)).toBeInTheDocument()
  })

  it('should render price in Crores when >= 100L', () => {
    const expensiveProperty = { ...mockProperty, price_lakhs: 150 }
    render(<MessagePropertyCard property={expensiveProperty} />)
    expect(screen.getByText(/1.50 Cr/i)).toBeInTheDocument()
  })

  it('should render "Price on request" when price is null', () => {
    const propertyWithoutPrice = { ...mockProperty, price_lakhs: null }
    render(<MessagePropertyCard property={propertyWithoutPrice} />)
    expect(screen.getByText(/Price on request/i)).toBeInTheDocument()
  })

  it('should render amenities (limited to 3)', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
    expect(screen.getByText('swimming pool')).toBeInTheDocument()
  })

  it('should render compare button', () => {
    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText(/Compare/i)).toBeInTheDocument()
  })

  it('should toggle compare on button click', async () => {
    const user = userEvent.setup()
    render(<MessagePropertyCard property={mockProperty} />)

    const button = screen.getByText(/Compare/i)
    await user.click(button)

    expect(useSearchStore.getState().compareList).toContainEqual(mockProperty)
  })

  it('should show "Added" when property is in compare list', async () => {
    useSearchStore.getState().addToCompare(mockProperty)

    render(<MessagePropertyCard property={mockProperty} />)
    expect(screen.getByText(/Added/i)).toBeInTheDocument()
  })
})
