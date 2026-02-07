import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChatMessage } from './ChatMessage'
import { useSearchStore } from '../../stores/searchStore'
import type { ChatMessage as ChatMessageType, Property } from '../../types'

// Mock ChatMapWidget since it lazy-loads react-leaflet internals
vi.mock('../Map/ChatMapWidget', () => ({
  ChatMapWidget: ({ properties }: { properties: Property[] }) => {
    const mappable = properties.filter(
      (p) => p.latitude !== null && p.longitude !== null
    )
    if (mappable.length === 0) return null
    return <div data-testid="chat-map-widget">{mappable.length} on map</div>
  },
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

const mockProperty: Property = {
  id: 'test-1',
  city: 'bangalore',
  title: 'Beautiful 2BHK Apartment',
  area: 'Whitefield',
  bhk: 2,
  sqft: 1200,
  bathrooms: 2,
  price_lakhs: 85,
  amenities: ['gym', 'parking'],
  latitude: 12.9716,
  longitude: 77.5946,
}

describe('ChatMessage', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('User messages', () => {
    it('should render user message text', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'user',
        contentType: 'text',
        text: '2BHK under 1Cr with gym',
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByText('2BHK under 1Cr with gym')).toBeInTheDocument()
    })

    it('should not render avatar for user messages', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'user',
        contentType: 'text',
        text: 'Hello',
        timestamp: new Date(),
      }

      const { container } = render(<ChatMessage message={message} />)
      // User messages are right-aligned with no avatar SVG container
      expect(container.querySelector('.rounded-full.bg-gradient-to-br')).not.toBeInTheDocument()
    })
  })

  describe('Assistant messages', () => {
    it('should render assistant message text', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'text',
        text: 'Found 5 properties matching your criteria',
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByText('Found 5 properties matching your criteria')).toBeInTheDocument()
    })

    it('should render avatar for assistant messages', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'text',
        text: 'Hello',
        timestamp: new Date(),
      }

      const { container } = render(<ChatMessage message={message} />)
      expect(container.querySelector('.rounded-full')).toBeInTheDocument()
    })

    it('should render error messages with error styling', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'error',
        text: 'Something went wrong',
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should render filter badges when filters are present', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'properties',
        text: 'Found properties',
        filters: {
          bhk: 2,
          min_price: null,
          max_price: 100,
          min_sqft: null,
          max_sqft: null,
          area: 'Whitefield',
          amenities: ['gym'],
        },
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByText(/2 BHK/i)).toBeInTheDocument()
    })
  })

  describe('Property cards', () => {
    it('should render property cards when message has properties', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'properties',
        text: 'Found 1 property',
        properties: [mockProperty],
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByText('Beautiful 2BHK Apartment')).toBeInTheDocument()
    })

    it('should render multiple property cards', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'properties',
        text: 'Found 2 properties',
        properties: [
          mockProperty,
          { ...mockProperty, id: 'test-2', title: '3BHK Luxury Villa' },
        ],
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByText('Beautiful 2BHK Apartment')).toBeInTheDocument()
      expect(screen.getByText('3BHK Luxury Villa')).toBeInTheDocument()
    })

    it('should not render property cards when properties array is empty', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'text',
        text: 'No properties found',
        properties: [],
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.queryByText(/BHK/)).not.toBeInTheDocument()
    })
  })

  describe('Map widget integration', () => {
    it('should render map widget after property cards', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'properties',
        text: 'Found properties',
        properties: [mockProperty],
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.getByTestId('chat-map-widget')).toBeInTheDocument()
      expect(screen.getByText('1 on map')).toBeInTheDocument()
    })

    it('should not render map widget when no properties have coordinates', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'properties',
        text: 'Found properties',
        properties: [
          { ...mockProperty, latitude: null, longitude: null },
        ],
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.queryByTestId('chat-map-widget')).not.toBeInTheDocument()
    })

    it('should not render map widget for user messages', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'user',
        contentType: 'text',
        text: 'Search query',
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.queryByTestId('chat-map-widget')).not.toBeInTheDocument()
    })

    it('should not render map widget for messages without properties', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'text',
        text: 'Welcome message',
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} />)
      expect(screen.queryByTestId('chat-map-widget')).not.toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('should render skeletons when isLoading is true', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'text',
        text: 'Searching...',
        timestamp: new Date(),
      }

      const { container } = render(<ChatMessage message={message} isLoading />)
      // PropertyCardSkeleton renders animated placeholder divs
      const skeletons = container.querySelectorAll('.animate-pulse')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('should not render property cards when isLoading is true', () => {
      const message: ChatMessageType = {
        id: '1',
        role: 'assistant',
        contentType: 'properties',
        text: 'Searching...',
        properties: [mockProperty],
        timestamp: new Date(),
      }

      render(<ChatMessage message={message} isLoading />)
      expect(screen.queryByText('Beautiful 2BHK Apartment')).not.toBeInTheDocument()
    })
  })
})
