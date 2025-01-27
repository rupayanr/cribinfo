import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WelcomeMessage } from './WelcomeMessage'

describe('WelcomeMessage', () => {
  const mockOnSuggestionClick = vi.fn()

  beforeEach(() => {
    mockOnSuggestionClick.mockClear()
  })

  it('should render welcome heading', () => {
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    expect(screen.getByText(/welcome to cribinfo/i)).toBeInTheDocument()
  })

  it('should render description text', () => {
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    expect(screen.getByText(/find your perfect home/i)).toBeInTheDocument()
  })

  it('should render suggestion chips', () => {
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    expect(screen.getByText('2BHK under 1Cr with gym')).toBeInTheDocument()
    expect(screen.getByText('3BHK in Whitefield')).toBeInTheDocument()
    expect(screen.getByText('Spacious flat with parking')).toBeInTheDocument()
    expect(screen.getByText('Near metro station')).toBeInTheDocument()
  })

  it('should call onSuggestionClick when chip is clicked', async () => {
    const user = userEvent.setup()
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    const chip = screen.getByText('2BHK under 1Cr with gym')
    await user.click(chip)

    expect(mockOnSuggestionClick).toHaveBeenCalledWith('2BHK under 1Cr with gym')
  })

  it('should call onSuggestionClick with correct text for each chip', async () => {
    const user = userEvent.setup()
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    const suggestions = [
      '2BHK under 1Cr with gym',
      '3BHK in Whitefield',
      'Spacious flat with parking',
      'Near metro station',
    ]

    for (const suggestion of suggestions) {
      mockOnSuggestionClick.mockClear()
      const chip = screen.getByText(suggestion)
      await user.click(chip)
      expect(mockOnSuggestionClick).toHaveBeenCalledWith(suggestion)
    }
  })

  it('should render try these searches label', () => {
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    expect(screen.getByText(/try these searches/i)).toBeInTheDocument()
  })

  it('should render powered by text', () => {
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    expect(screen.getByText(/powered by ai-driven property search/i)).toBeInTheDocument()
  })
})
