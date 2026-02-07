import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Property } from '../../types'

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom, style }: { children: React.ReactNode; center: [number, number]; zoom: number; style: React.CSSProperties }) => (
    <div data-testid="map-container" data-center={center.join(',')} data-zoom={zoom} style={style}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, eventHandlers }: { children: React.ReactNode; eventHandlers?: { click?: () => void } }) => (
    <div data-testid="marker" onClick={eventHandlers?.click}>{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
}))

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
    Marker: {
      prototype: {
        options: {},
      },
    },
  },
}))

// Mock leaflet CSS
vi.mock('leaflet/dist/leaflet.css', () => ({}))

// Mock marker images
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: 'marker-icon.png' }))
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: 'marker-shadow.png' }))
vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: 'marker-icon-2x.png' }))

// Mock useCompare hook
const mockToggleCompare = vi.fn()
vi.mock('../../hooks/useCompare', () => ({
  useCompare: () => ({
    isInCompareList: vi.fn((id) => id === '1'),
    toggleCompare: mockToggleCompare,
    canAddMore: true,
  }),
}))

// Mock useSearchStore
const mockSelectProperty = vi.fn()
vi.mock('../../stores/searchStore', () => ({
  useSearchStore: vi.fn(() => ({
    results: [],
    city: 'bangalore',
    selectProperty: mockSelectProperty,
  })),
}))

// Import after mocks
import { PropertyMap } from './PropertyMap'
import { useSearchStore } from '../../stores/searchStore'

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
    amenities: ['gym', 'pool', 'parking'],
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
    latitude: 12.95,
    longitude: 77.65,
  },
]

describe('PropertyMap', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useSearchStore).mockReturnValue({
      results: [],
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)
  })

  it('should render map container', () => {
    render(<PropertyMap />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('should render tile layer', () => {
    render(<PropertyMap />)
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
  })

  it('should show empty state when no properties', () => {
    render(<PropertyMap />)
    expect(screen.getByText('No properties to display')).toBeInTheDocument()
    expect(screen.getByText('Search for properties to see them on the map')).toBeInTheDocument()
  })

  it('should show property count in header', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('2 properties on map')).toBeInTheDocument()
  })

  it('should render markers for properties with coordinates', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
  })

  it('should filter out properties without coordinates', () => {
    const propertiesWithMissing = [
      ...mockProperties,
      { ...mockProperties[0], id: '3', latitude: null, longitude: null },
    ]

    vi.mocked(useSearchStore).mockReturnValue({
      results: propertiesWithMissing,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('2 properties on map')).toBeInTheDocument()
  })

  it('should render property popup content', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('Luxury Apartment')).toBeInTheDocument()
    expect(screen.getByText('Modern Flat')).toBeInTheDocument()
  })

  it('should format price in crores correctly', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('1.50 Cr')).toBeInTheDocument()
  })

  it('should format price in lakhs correctly', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('85 L')).toBeInTheDocument()
  })

  it('should show "Price on request" for null price', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: [{ ...mockProperties[0], price_lakhs: null }],
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })

  it('should show area in popup', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('Koramangala')).toBeInTheDocument()
    expect(screen.getByText('Whitefield')).toBeInTheDocument()
  })

  it('should show BHK, sqft, and bathrooms in popup', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: [mockProperties[0]],
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('3 BHK')).toBeInTheDocument()
    expect(screen.getByText('1500 sqft')).toBeInTheDocument()
    expect(screen.getByText('2 Bath')).toBeInTheDocument()
  })

  it('should show amenities in popup (max 3)', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: [mockProperties[0]],
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('pool')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
  })

  it('should use fallback title when title is null', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: [{ ...mockProperties[0], title: null }],
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    expect(screen.getByText('3 BHK in Koramangala')).toBeInTheDocument()
  })

  it('should call selectProperty and onPropertySelect when marker is clicked', () => {
    const mockOnPropertySelect = vi.fn()
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap onPropertySelect={mockOnPropertySelect} />)
    const marker = screen.getAllByTestId('marker')[0]
    fireEvent.click(marker)

    expect(mockSelectProperty).toHaveBeenCalledWith(mockProperties[0])
    expect(mockOnPropertySelect).toHaveBeenCalledWith(mockProperties[0])
  })

  it('should show "Added" for properties in compare list', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    // Property with id '1' is mocked to be in compare list
    expect(screen.getByText('✓ Added')).toBeInTheDocument()
  })

  it('should show "+ Compare" for properties not in compare list', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: mockProperties,
      city: 'bangalore',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    // Property with id '2' is not in compare list
    expect(screen.getByText('+ Compare')).toBeInTheDocument()
  })

  it('should center map on city coordinates', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: [],
      city: 'mumbai',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toHaveAttribute('data-center', '19.076,72.8777')
  })

  it('should default to bangalore center for unknown city', () => {
    vi.mocked(useSearchStore).mockReturnValue({
      results: [],
      city: 'unknown',
      selectProperty: mockSelectProperty,
    } as ReturnType<typeof useSearchStore>)

    render(<PropertyMap />)
    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toHaveAttribute('data-center', '12.9716,77.5946')
  })
})
