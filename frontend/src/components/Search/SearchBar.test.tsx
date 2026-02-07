import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from './SearchBar'
import { useSearchStore } from '../../stores/searchStore'

// Mock useSearch hook
const mockSearch = vi.fn()
vi.mock('../../hooks/useSearch', () => ({
  useSearch: () => ({
    search: mockSearch,
  }),
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSearchStore.setState({
      query: '',
      isLoading: false,
    })
  })

  it('should render search input', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/search properties/i)).toBeInTheDocument()
  })

  it('should render search button', () => {
    render(<SearchBar />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('should initialize with query from store', () => {
    useSearchStore.setState({ query: 'initial query' })
    render(<SearchBar />)
    expect(screen.getByDisplayValue('initial query')).toBeInTheDocument()
  })

  it('should update input value on typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    await user.type(input, '2BHK')

    expect(input).toHaveValue('2BHK')
  })

  it('should call search and setQuery on form submit', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    await user.type(input, '2BHK under 1Cr')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(useSearchStore.getState().query).toBe('2BHK under 1Cr')
    expect(mockSearch).toHaveBeenCalledWith('2BHK under 1Cr')
  })

  it('should call search on Enter key press', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    await user.type(input, '3BHK with gym{Enter}')

    expect(mockSearch).toHaveBeenCalledWith('3BHK with gym')
  })

  it('should disable input when loading', () => {
    useSearchStore.setState({ isLoading: true })
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    expect(input).toBeDisabled()
  })

  it('should disable button when loading', () => {
    useSearchStore.setState({ isLoading: true })
    render(<SearchBar />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should show "Searching..." text when loading', () => {
    useSearchStore.setState({ isLoading: true })
    render(<SearchBar />)

    expect(screen.getByRole('button')).toHaveTextContent('Searching...')
  })

  it('should disable button when input is empty', () => {
    render(<SearchBar />)

    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toBeDisabled()
  })

  it('should disable button when input contains only whitespace', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    await user.type(input, '   ')

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should enable button when input has content', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    await user.type(input, 'test')

    const button = screen.getByRole('button', { name: /search/i })
    expect(button).not.toBeDisabled()
  })

  it('should have correct placeholder text with example', () => {
    render(<SearchBar />)
    expect(screen.getByPlaceholderText(/2bhk under 1cr with gym in koramangala/i)).toBeInTheDocument()
  })

  it('should prevent default form submission', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)

    const input = screen.getByPlaceholderText(/search properties/i)
    await user.type(input, 'test query{Enter}')

    // If default wasn't prevented, the page would reload and test would fail
    expect(mockSearch).toHaveBeenCalled()
  })

  it('should have correct input styling', () => {
    render(<SearchBar />)
    const input = screen.getByPlaceholderText(/search properties/i)
    expect(input).toHaveClass('border-gray-300')
    expect(input).toHaveClass('rounded-lg')
  })

  it('should have correct button styling', () => {
    render(<SearchBar />)
    const button = screen.getByRole('button', { name: /search/i })
    expect(button).toHaveClass('bg-blue-600')
    expect(button).toHaveClass('rounded-lg')
  })
})
