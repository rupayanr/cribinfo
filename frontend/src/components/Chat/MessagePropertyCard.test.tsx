import { describe, it, expect, beforeEach } from 'vitest'
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

  it('should show "+N more" button when more than 3 amenities', () => {
    const propertyWithManyAmenities = {
      ...mockProperty,
      amenities: ['gym', 'parking', 'swimming pool', 'garden', 'clubhouse'],
    }
    render(<MessagePropertyCard property={propertyWithManyAmenities} />)
    expect(screen.getByText(/\+2 more/i)).toBeInTheDocument()
  })

  it('should show all amenities when "+N more" is clicked', async () => {
    const user = userEvent.setup()
    const propertyWithManyAmenities = {
      ...mockProperty,
      amenities: ['gym', 'parking', 'swimming pool', 'garden', 'clubhouse'],
    }
    render(<MessagePropertyCard property={propertyWithManyAmenities} />)

    const moreButton = screen.getByText(/\+2 more/i)
    await user.click(moreButton)

    // Now all amenities should be visible
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
    expect(screen.getByText('swimming pool')).toBeInTheDocument()
    expect(screen.getByText('garden')).toBeInTheDocument()
    expect(screen.getByText('clubhouse')).toBeInTheDocument()
    expect(screen.getByText(/Show less/i)).toBeInTheDocument()
  })

  it('should collapse amenities when "Show less" is clicked', async () => {
    const user = userEvent.setup()
    const propertyWithManyAmenities = {
      ...mockProperty,
      amenities: ['gym', 'parking', 'swimming pool', 'garden', 'clubhouse'],
    }
    render(<MessagePropertyCard property={propertyWithManyAmenities} />)

    // Expand
    await user.click(screen.getByText(/\+2 more/i))
    expect(screen.getByText('garden')).toBeInTheDocument()

    // Collapse
    await user.click(screen.getByText(/Show less/i))
    expect(screen.queryByText('garden')).not.toBeInTheDocument()
    expect(screen.getByText(/\+2 more/i)).toBeInTheDocument()
  })

  it('should disable compare button when list is full', () => {
    // Add 5 properties to fill the compare list
    for (let i = 0; i < 5; i++) {
      useSearchStore.getState().addToCompare({
        ...mockProperty,
        id: `prop-${i}`,
      })
    }

    const newProperty = { ...mockProperty, id: 'new-prop' }
    render(<MessagePropertyCard property={newProperty} />)

    const button = screen.getByRole('button', { name: /Compare/i })
    expect(button).toBeDisabled()
  })

  it('should not disable compare button for property already in list when list is full', () => {
    // Add 5 properties including our test property
    useSearchStore.getState().addToCompare(mockProperty)
    for (let i = 0; i < 4; i++) {
      useSearchStore.getState().addToCompare({
        ...mockProperty,
        id: `prop-${i}`,
      })
    }

    render(<MessagePropertyCard property={mockProperty} />)

    const button = screen.getByRole('button', { name: /Added/i })
    expect(button).not.toBeDisabled()
  })

  it('should not render BHK section when bhk is null', () => {
    const propertyWithoutBhk = { ...mockProperty, bhk: null, title: 'Test Property' }
    render(<MessagePropertyCard property={propertyWithoutBhk} />)
    // The BHK badge in the stats section should not be present
    const statsSection = document.querySelector('.border-y')
    expect(statsSection?.textContent).not.toContain('BHK')
  })

  it('should not render sqft section when sqft is null', () => {
    const propertyWithoutSqft = { ...mockProperty, sqft: null }
    render(<MessagePropertyCard property={propertyWithoutSqft} />)
    expect(screen.queryByText(/sqft/i)).not.toBeInTheDocument()
  })

  it('should not render bathrooms section when bathrooms is null', () => {
    const propertyWithoutBath = { ...mockProperty, bathrooms: null }
    render(<MessagePropertyCard property={propertyWithoutBath} />)
    expect(screen.queryByText(/Bath/i)).not.toBeInTheDocument()
  })

  it('should not render amenities section when amenities is empty', () => {
    const propertyWithoutAmenities = { ...mockProperty, amenities: [] }
    render(<MessagePropertyCard property={propertyWithoutAmenities} />)
    expect(screen.queryByText('gym')).not.toBeInTheDocument()
  })

  it('should remove from compare when already added', async () => {
    const user = userEvent.setup()
    useSearchStore.getState().addToCompare(mockProperty)

    render(<MessagePropertyCard property={mockProperty} />)

    const button = screen.getByRole('button', { name: /Added/i })
    await user.click(button)

    expect(useSearchStore.getState().compareList).not.toContainEqual(mockProperty)
  })
})
