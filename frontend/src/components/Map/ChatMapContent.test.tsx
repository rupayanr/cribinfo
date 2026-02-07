import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Property } from '../../types'

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, style }: { children: React.ReactNode; style: React.CSSProperties }) => (
    <div data-testid="map-container" style={style}>{children}</div>
  ),
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children, position }: { children: React.ReactNode; position: [number, number] }) => (
    <div data-testid="marker" data-position={position.join(',')}>{children}</div>
  ),
  Popup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="popup">{children}</div>
  ),
  useMap: () => ({
    invalidateSize: vi.fn(),
  }),
}))

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
    latLngBounds: vi.fn(() => ({})),
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

// Import after mocks
import ChatMapContent from './ChatMapContent'

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
    latitude: 12.95,
    longitude: 77.65,
  },
]

describe('ChatMapContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render map container', () => {
    render(<ChatMapContent properties={mockProperties} height="200px" />)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
  })

  it('should render tile layer', () => {
    render(<ChatMapContent properties={mockProperties} height="200px" />)
    expect(screen.getByTestId('tile-layer')).toBeInTheDocument()
  })

  it('should render markers for each property', () => {
    render(<ChatMapContent properties={mockProperties} height="200px" />)
    const markers = screen.getAllByTestId('marker')
    expect(markers).toHaveLength(2)
  })

  it('should render popups with property info', () => {
    render(<ChatMapContent properties={mockProperties} height="200px" />)
    expect(screen.getByText('Luxury Apartment')).toBeInTheDocument()
    expect(screen.getByText('Modern Flat')).toBeInTheDocument()
  })

  it('should format price correctly in popup', () => {
    render(<ChatMapContent properties={mockProperties} height="200px" />)
    expect(screen.getByText('1.50 Cr')).toBeInTheDocument()
    expect(screen.getByText('85 L')).toBeInTheDocument()
  })

  it('should show area in popup', () => {
    render(<ChatMapContent properties={mockProperties} height="200px" />)
    expect(screen.getByText('Koramangala')).toBeInTheDocument()
    expect(screen.getByText('Whitefield')).toBeInTheDocument()
  })

  it('should show compare button when showCompare is true', () => {
    const mockOnCompare = vi.fn()
    render(
      <ChatMapContent
        properties={mockProperties}
        height="200px"
        showCompare={true}
        onCompare={mockOnCompare}
        isCompared={() => false}
      />
    )
    expect(screen.getAllByText('+ Compare')).toHaveLength(2)
  })

  it('should show "Added" when property is compared', () => {
    const mockOnCompare = vi.fn()
    render(
      <ChatMapContent
        properties={mockProperties}
        height="200px"
        showCompare={true}
        onCompare={mockOnCompare}
        isCompared={(id) => id === '1'}
      />
    )
    expect(screen.getByText('✓ Added')).toBeInTheDocument()
  })

  it('should use correct height style', () => {
    render(<ChatMapContent properties={mockProperties} height="300px" />)
    const mapContainer = screen.getByTestId('map-container')
    expect(mapContainer).toHaveStyle({ height: '300px' })
  })

  it('should show fallback title when title is missing', () => {
    const propertiesWithoutTitle = [
      { ...mockProperties[0], title: null },
    ]
    render(<ChatMapContent properties={propertiesWithoutTitle} height="200px" />)
    expect(screen.getByText('3 BHK in Koramangala')).toBeInTheDocument()
  })

  it('should show "Price on request" for null price', () => {
    const propertiesWithoutPrice = [
      { ...mockProperties[0], price_lakhs: null },
    ]
    render(<ChatMapContent properties={propertiesWithoutPrice} height="200px" />)
    expect(screen.getByText('Price on request')).toBeInTheDocument()
  })
})
