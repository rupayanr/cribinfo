import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import { useSearchStore } from './stores/searchStore'

// Mock child components to isolate App behavior
vi.mock('./components/Search/CitySelector', () => ({
  CitySelector: () => <div data-testid="city-selector">CitySelector</div>,
}))

vi.mock('./components/Chat', () => ({
  ChatContainer: () => {
    const { clearChat, clearCompare } = useSearchStore()
    return (
      <div data-testid="chat-container">
        ChatContainer
        <button
          title="Clear chat"
          onClick={() => {
            clearChat()
            clearCompare()
          }}
        >
          Clear
        </button>
      </div>
    )
  },
}))

vi.mock('./components/Property/CompareView', () => ({
  CompareView: () => <div data-testid="compare-view">CompareView</div>,
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

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <App />
    </MemoryRouter>
  )
}

describe('App', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render the CribInfo header', () => {
    renderApp()
    expect(screen.getByText('CribInfo')).toBeInTheDocument()
  })

  it('should render CitySelector', () => {
    renderApp()
    expect(screen.getByTestId('city-selector')).toBeInTheDocument()
  })

  it('should render ChatContainer', () => {
    renderApp()
    expect(screen.getByTestId('chat-container')).toBeInTheDocument()
  })

  it('should render CompareView', () => {
    renderApp()
    expect(screen.getByTestId('compare-view')).toBeInTheDocument()
  })

  it('should render hamburger menu button', () => {
    renderApp()
    expect(screen.getByTitle('Menu')).toBeInTheDocument()
  })

  it('should not render Chat/Map toggle buttons', () => {
    useSearchStore.setState({
      results: [
        {
          id: '1',
          city: 'bangalore',
          title: 'Test',
          area: 'Whitefield',
          bhk: 2,
          sqft: 1200,
          bathrooms: 2,
          price_lakhs: 85,
          amenities: [],
          latitude: 12.9,
          longitude: 77.5,
        },
      ],
    })

    renderApp()
    // The nav links "Chat" now exists, but no "Map" toggle
    expect(screen.queryByText('Map')).not.toBeInTheDocument()
  })

  it('should always render ChatContainer regardless of results', () => {
    useSearchStore.setState({
      results: [
        {
          id: '1',
          city: 'bangalore',
          title: 'Test',
          area: 'Whitefield',
          bhk: 2,
          sqft: 1200,
          bathrooms: 2,
          price_lakhs: 85,
          amenities: [],
          latitude: 12.9,
          longitude: 77.5,
        },
      ],
    })

    renderApp()
    expect(screen.getByTestId('chat-container')).toBeInTheDocument()
  })

  it('should call clearChat and clearCompare when Clear chat is clicked', async () => {
    const user = userEvent.setup()

    // Populate state
    useSearchStore.getState().addUserMessage('test query')
    useSearchStore.getState().addToCompare({
      id: '1',
      city: 'bangalore',
      title: 'Test',
      area: 'Whitefield',
      bhk: 2,
      sqft: 1200,
      bathrooms: 2,
      price_lakhs: 85,
      amenities: [],
      latitude: 12.9,
      longitude: 77.5,
    })

    renderApp()

    await user.click(screen.getByTitle('Clear chat'))

    const state = useSearchStore.getState()
    expect(state.messages).toHaveLength(0)
    expect(state.results).toHaveLength(0)
    expect(state.compareList).toHaveLength(0)
  })
})
