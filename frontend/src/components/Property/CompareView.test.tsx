import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompareView } from './CompareView'
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
    amenities: ['gym', 'pool'],
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
    amenities: ['parking'],
    latitude: 12.9,
    longitude: 77.7,
  },
]

describe('CompareView', () => {
  beforeEach(() => {
    useSearchStore.setState({
      compareList: [],
    })
  })

  it('should not render when compareList is empty', () => {
    const { container } = render(<CompareView />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when compareList has items', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)
    expect(screen.getByText('Compare (2/5)')).toBeInTheDocument()
  })

  it('should display property areas in header', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)
    // Areas appear multiple times (header + summary tags), so use getAllByText
    expect(screen.getAllByText('Koramangala').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Whitefield').length).toBeGreaterThan(0)
  })

  it('should display BHK values', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)
    // BHK row should contain values in badge format
    const bhkRow = screen.getByText('BHK').closest('tr')
    expect(bhkRow).toHaveTextContent('3 BHK')
  })

  it('should format price in Cr for values >= 100L', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)
    // Prices appear in both table and summary tags
    expect(screen.getAllByText('1.50 Cr').length).toBeGreaterThan(0)
  })

  it('should format price in L for values < 100L', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)
    // Prices appear in both table and summary tags
    expect(screen.getAllByText('85 L').length).toBeGreaterThan(0)
  })

  it('should display sqft values', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)
    // Values are now formatted with locale (1,500 sqft)
    expect(screen.getByText('1,500 sqft')).toBeInTheDocument()
    expect(screen.getByText('1,200 sqft')).toBeInTheDocument()
  })

  it('should remove property when x button is clicked', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    const removeButtons = screen.getAllByText('×')
    await user.click(removeButtons[0])

    expect(useSearchStore.getState().compareList).toHaveLength(1)
    expect(useSearchStore.getState().compareList[0].id).toBe('2')
  })

  it('should clear all properties when Clear All is clicked', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    const clearButton = screen.getByText('Clear All')
    await user.click(clearButton)

    expect(useSearchStore.getState().compareList).toHaveLength(0)
  })

  it('should show N/A for missing values', () => {
    useSearchStore.setState({
      compareList: [{
        id: '3',
        city: 'bangalore',
        title: null,
        area: 'Test',
        bhk: null,
        sqft: null,
        bathrooms: null,
        price_lakhs: null,
        amenities: [],
        latitude: null,
        longitude: null,
      }],
    })

    render(<CompareView />)
    // Price row should show N/A for null price
    const priceRow = screen.getByText('Price').closest('tr')
    expect(priceRow).toHaveTextContent('N/A')
  })
})
