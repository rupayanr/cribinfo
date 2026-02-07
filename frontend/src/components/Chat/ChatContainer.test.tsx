import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatContainer } from './ChatContainer'
import { useSearchStore } from '../../stores/searchStore'

// Mock the hooks
vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => ({
    searchWithChat: vi.fn(),
  }),
}))

describe('ChatContainer', () => {
  beforeEach(() => {
    // Reset the store before each test
    useSearchStore.setState({
      messages: [],
      isTyping: false,
      city: 'bangalore',
      compareList: [],
    })
  })

  it('should render welcome message when no messages', () => {
    render(<ChatContainer />)
    expect(screen.getByText(/welcome to cribinfo/i)).toBeInTheDocument()
  })

  it('should render chat input', () => {
    render(<ChatContainer />)
    expect(screen.getByPlaceholderText(/2bhk under 1cr/i)).toBeInTheDocument()
  })

  it('should render messages when present', () => {
    useSearchStore.setState({
      messages: [
        {
          id: '1',
          role: 'user',
          contentType: 'text',
          text: 'Show me 2BHK flats',
          timestamp: new Date(),
        },
        {
          id: '2',
          role: 'assistant',
          contentType: 'text',
          text: 'I found 5 properties',
          timestamp: new Date(),
        },
      ],
      city: 'bangalore',
    })

    render(<ChatContainer />)
    expect(screen.getByText('Show me 2BHK flats')).toBeInTheDocument()
    expect(screen.getByText('I found 5 properties')).toBeInTheDocument()
  })

  it('should show clear chat button when messages exist', () => {
    useSearchStore.setState({
      messages: [
        {
          id: '1',
          role: 'user',
          contentType: 'text',
          text: 'Test message',
          timestamp: new Date(),
        },
      ],
      city: 'bangalore',
    })

    render(<ChatContainer />)
    expect(screen.getByText('Clear chat')).toBeInTheDocument()
  })

  it('should clear messages when clear chat is clicked', async () => {
    const user = userEvent.setup()

    useSearchStore.setState({
      messages: [
        {
          id: '1',
          role: 'user',
          contentType: 'text',
          text: 'Test message',
          timestamp: new Date(),
        },
      ],
      city: 'bangalore',
    })

    render(<ChatContainer />)

    const clearButton = screen.getByText('Clear chat')
    await user.click(clearButton)

    await waitFor(() => {
      expect(screen.getByText(/welcome to cribinfo/i)).toBeInTheDocument()
    })
  })

  it('should show typing indicator when isTyping is true', () => {
    useSearchStore.setState({
      messages: [
        {
          id: '1',
          role: 'user',
          contentType: 'text',
          text: 'Test message',
          timestamp: new Date(),
        },
      ],
      isTyping: true,
      city: 'bangalore',
    })

    render(<ChatContainer />)
    // TypingIndicator renders dots
    const typingIndicator = document.querySelector('.animate-bounce')
    expect(typingIndicator).toBeInTheDocument()
  })

  it('should disable input when city is not selected', () => {
    useSearchStore.setState({
      messages: [],
      city: '',
    })

    render(<ChatContainer />)
    expect(screen.getByText(/select a city to start/i)).toBeInTheDocument()
  })

  it('should show city-specific suggestions in welcome message', () => {
    useSearchStore.setState({
      messages: [],
      city: 'bangalore',
    })

    render(<ChatContainer />)
    expect(screen.getByText('2BHK under 80L with gym')).toBeInTheDocument()
    expect(screen.getByText('3BHK in Whitefield')).toBeInTheDocument()
  })
})
