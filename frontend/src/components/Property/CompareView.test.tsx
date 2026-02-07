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

  it('should display BHK values', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Switch to table view to test table-specific layout
    const tableButton = screen.getByText('Table')
    await user.click(tableButton)

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

  it('should show N/A for missing values', async () => {
    const user = userEvent.setup()

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

    // Switch to table view to test table-specific layout
    const tableButton = screen.getByText('Table')
    await user.click(tableButton)

    // Price row should show N/A for null price
    const priceRow = screen.getByText('Price').closest('tr')
    expect(priceRow).toHaveTextContent('N/A')
  })

  it('should default to Cards view', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    const cardsButton = screen.getByText('Cards')
    expect(cardsButton).toHaveClass('bg-white')
  })

  it('should switch between Cards and Table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Initially in Cards view
    expect(screen.getByText('Cards')).toHaveClass('bg-white')

    // Switch to Table
    await user.click(screen.getByText('Table'))
    expect(screen.getByText('Table')).toHaveClass('bg-white')

    // Switch back to Cards
    await user.click(screen.getByText('Cards'))
    expect(screen.getByText('Cards')).toHaveClass('bg-white')
  })

  it('should toggle expand/collapse', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Initially collapsed
    const expandBtn = screen.getByText('Expand')
    await user.click(expandBtn)

    // Should now show Collapse
    expect(screen.getByText('Collapse')).toBeInTheDocument()

    // Click collapse
    await user.click(screen.getByText('Collapse'))
    expect(screen.getByText('Expand')).toBeInTheDocument()
  })

  it('should show amenities in expanded cards view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Expand
    await user.click(screen.getByText('Expand'))

    // Amenities should be visible
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('pool')).toBeInTheDocument()
  })

  it('should show location links in expanded view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Expand
    await user.click(screen.getByText('Expand'))

    // Location links should be visible
    const mapLinks = screen.getAllByText('View on Map')
    expect(mapLinks.length).toBeGreaterThan(0)
  })

  it('should highlight best price', async () => {
    useSearchStore.setState({
      compareList: mockProperties, // 85L is the lowest
    })

    render(<CompareView />)

    // The 85L property should have "Lowest Price" badge in cards view
    expect(screen.getByText('Lowest Price')).toBeInTheDocument()
  })

  it('should highlight largest property', () => {
    useSearchStore.setState({
      compareList: mockProperties, // 1500 sqft is the largest
    })

    render(<CompareView />)

    // The 1500 sqft property should have "Largest" badge
    expect(screen.getByText('Largest')).toBeInTheDocument()
  })

  it('should highlight best value (price/sqft)', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // One property should have "Best Value" badge
    expect(screen.getByText('Best Value')).toBeInTheDocument()
  })

  it('should show star ratings in card view', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Star ratings should be visible (checking for stars via title)
    const starContainers = document.querySelectorAll('[title*="out of 5 stars"]')
    expect(starContainers.length).toBeGreaterThan(0)
  })

  it('should show star ratings in table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    await user.click(screen.getByText('Table'))

    // Rating row should be visible
    expect(screen.getByText('Rating')).toBeInTheDocument()
  })

  it('should show gradient header in card view', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Check for gradient classes
    const gradientHeaders = document.querySelectorAll('[class*="bg-gradient-to-br"]')
    expect(gradientHeaders.length).toBeGreaterThan(0)
  })

  it('should render amenities checkmarks in table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    await user.click(screen.getByText('Table'))

    // Amenities section header
    expect(screen.getByText('Amenities')).toBeInTheDocument()

    // Individual amenities
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('pool')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
  })

  it('should show city in table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    await user.click(screen.getByText('Table'))

    const cityRow = screen.getByText('City').closest('tr')
    expect(cityRow).toHaveTextContent('bangalore')
  })

  it('should show bathrooms in table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    await user.click(screen.getByText('Table'))

    const bathroomsRow = screen.getByText('Bathrooms').closest('tr')
    expect(bathroomsRow).toHaveTextContent('2')
  })

  it('should show price/sqft in table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    await user.click(screen.getByText('Table'))

    expect(screen.getByText('Price/sqft')).toBeInTheDocument()
  })

  it('should show location in expanded table view', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    await user.click(screen.getByText('Table'))
    await user.click(screen.getByText('Expand'))

    expect(screen.getByText('Location')).toBeInTheDocument()
  })

  it('should not highlight best values for single property', () => {
    useSearchStore.setState({
      compareList: [mockProperties[0]],
    })

    render(<CompareView />)

    // Should not show any highlight badges for single property
    expect(screen.queryByText('Lowest Price')).not.toBeInTheDocument()
    expect(screen.queryByText('Largest')).not.toBeInTheDocument()
    expect(screen.queryByText('Best Value')).not.toBeInTheDocument()
  })

  it('should show summary tags at bottom', () => {
    useSearchStore.setState({
      compareList: mockProperties,
    })

    render(<CompareView />)

    // Summary tags should show area and BHK
    const summarySection = document.querySelector('.border-t.border-gray-200')
    expect(summarySection).toBeInTheDocument()
  })

  it('should handle property without title in cards view', () => {
    useSearchStore.setState({
      compareList: [{
        ...mockProperties[0],
        title: null,
      }],
    })

    render(<CompareView />)

    // Should fall back to area name (appears multiple times)
    expect(screen.getAllByText('Koramangala').length).toBeGreaterThan(0)
  })

  it('should show +N more for properties with many amenities', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      compareList: [{
        ...mockProperties[0],
        amenities: ['gym', 'pool', 'parking', 'garden', 'clubhouse', 'security', 'power backup', 'lift'],
      }],
    })

    render(<CompareView />)

    await user.click(screen.getByText('Expand'))

    // Should show "+2 more" for 8 amenities (showing 6)
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })
})
