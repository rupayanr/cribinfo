import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatMapWidget } from './ChatMapWidget'
import { useSearchStore } from '../../stores/searchStore'
import type { Property } from '../../types'

// Mock the lazy-loaded ChatMapContent
vi.mock('./ChatMapContent', () => ({
  default: ({ properties, showCompare, onCompare, isCompared }: any) => (
    <div data-testid="chat-map-content">
      <span data-testid="map-property-count">{properties.length}</span>
      {showCompare && <span data-testid="compare-enabled" />}
      {properties.map((p: Property) => (
        <div key={p.id} data-testid={`marker-${p.id}`}>
          {p.title}
          {showCompare && onCompare && (
            <button
              data-testid={`compare-btn-${p.id}`}
              onClick={() => onCompare(p)}
            >
              {isCompared?.(p.id) ? 'Added' : 'Compare'}
            </button>
          )}
        </div>
      ))}
    </div>
  ),
}))

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

const makeProperty = (overrides: Partial<Property> = {}): Property => ({
  id: 'test-1',
  city: 'bangalore',
  title: 'Test Property',
  area: 'Whitefield',
  bhk: 2,
  sqft: 1200,
  bathrooms: 2,
  price_lakhs: 85,
  amenities: ['gym'],
  latitude: 12.9716,
  longitude: 77.5946,
  ...overrides,
})

describe('ChatMapWidget', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should return null when no properties have coordinates', () => {
    const properties = [
      makeProperty({ id: '1', latitude: null, longitude: null }),
      makeProperty({ id: '2', latitude: null, longitude: 77.5 }),
      makeProperty({ id: '3', latitude: 12.9, longitude: null }),
    ]

    const { container } = render(<ChatMapWidget properties={properties} />)
    expect(container.innerHTML).toBe('')
  })

  it('should return null when properties array is empty', () => {
    const { container } = render(<ChatMapWidget properties={[]} />)
    expect(container.innerHTML).toBe('')
  })

  it('should render map when properties have valid coordinates', async () => {
    const properties = [
      makeProperty({ id: '1' }),
      makeProperty({ id: '2', latitude: 13.0, longitude: 77.6 }),
    ]

    render(<ChatMapWidget properties={properties} />)

    expect(await screen.findByTestId('chat-map-content')).toBeInTheDocument()
  })

  it('should filter out properties without coordinates', async () => {
    const properties = [
      makeProperty({ id: '1' }),
      makeProperty({ id: '2', latitude: null, longitude: null }),
      makeProperty({ id: '3', latitude: 13.0, longitude: 77.6 }),
    ]

    render(<ChatMapWidget properties={properties} />)

    const count = await screen.findByTestId('map-property-count')
    expect(count.textContent).toBe('2')
  })

  it('should show count badge with correct number', async () => {
    const properties = [
      makeProperty({ id: '1' }),
      makeProperty({ id: '2', latitude: 13.0, longitude: 77.6 }),
      makeProperty({ id: '3', latitude: 13.1, longitude: 77.7 }),
    ]

    render(<ChatMapWidget properties={properties} />)

    expect(await screen.findByText('3 on map')).toBeInTheDocument()
  })

  it('should show expand button', async () => {
    render(<ChatMapWidget properties={[makeProperty()]} />)

    expect(await screen.findByText('Expand Map')).toBeInTheDocument()
  })

  it('should show expanded modal when Expand Map is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatMapWidget properties={[makeProperty()]} />)

    const expandBtn = await screen.findByText('Expand Map')
    await user.click(expandBtn)

    expect(screen.getByText('1 properties on map')).toBeInTheDocument()
    // Modal should have compare enabled
    const modalMaps = screen.getAllByTestId('chat-map-content')
    expect(modalMaps.length).toBe(2) // inline + expanded
  })

  it('should close expanded modal when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<ChatMapWidget properties={[makeProperty()]} />)

    await user.click(await screen.findByText('Expand Map'))
    expect(screen.getByText('1 properties on map')).toBeInTheDocument()

    // Find and click the close button (the X svg button in the modal header)
    const modal = screen.getByText('1 properties on map').closest('div')!
    const closeBtn = within(modal).getByRole('button')
    await user.click(closeBtn)

    expect(screen.queryByText('1 properties on map')).not.toBeInTheDocument()
  })

  it('should render compare buttons in expanded modal', async () => {
    const user = userEvent.setup()
    const property = makeProperty({ id: 'prop-1' })
    render(<ChatMapWidget properties={[property]} />)

    await user.click(await screen.findByText('Expand Map'))

    // The expanded modal should have compare enabled
    const compareEnabledElements = screen.getAllByTestId('compare-enabled')
    expect(compareEnabledElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle compare toggle in expanded modal', async () => {
    const user = userEvent.setup()
    const property = makeProperty({ id: 'prop-1' })
    render(<ChatMapWidget properties={[property]} />)

    await user.click(await screen.findByText('Expand Map'))

    // Find the compare button in the expanded modal content
    const compareBtns = screen.getAllByTestId('compare-btn-prop-1')
    const modalCompareBtn = compareBtns[compareBtns.length - 1]
    await user.click(modalCompareBtn)

    expect(useSearchStore.getState().compareList).toContainEqual(property)
  })
})
