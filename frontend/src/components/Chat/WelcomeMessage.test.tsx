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

  it('should render default suggestion chips when no city selected', () => {
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} />)

    // Default suggestions when no city is selected
    expect(screen.getByText('2BHK with gym')).toBeInTheDocument()
    expect(screen.getByText('3BHK spacious flat')).toBeInTheDocument()
    expect(screen.getByText('Flat with parking')).toBeInTheDocument()
    expect(screen.getByText('Near metro station')).toBeInTheDocument()
  })

  it('should render Bangalore-specific suggestions', () => {
    render(
      <WelcomeMessage
        onSuggestionClick={mockOnSuggestionClick}
        citySelected={true}
        selectedCity="bangalore"
      />
    )

    expect(screen.getByText('2BHK under 80L with gym')).toBeInTheDocument()
    expect(screen.getByText('3BHK in Whitefield')).toBeInTheDocument()
  })

  it('should render Mumbai-specific suggestions', () => {
    render(
      <WelcomeMessage
        onSuggestionClick={mockOnSuggestionClick}
        citySelected={true}
        selectedCity="mumbai"
      />
    )

    expect(screen.getByText('3BHK with sea view in Bandra')).toBeInTheDocument()
    expect(screen.getByText('2BHK in Powai with lake view')).toBeInTheDocument()
  })

  it('should render Delhi-specific suggestions', () => {
    render(
      <WelcomeMessage
        onSuggestionClick={mockOnSuggestionClick}
        citySelected={true}
        selectedCity="delhi"
      />
    )

    expect(screen.getByText('3BHK in Greater Kailash')).toBeInTheDocument()
    expect(screen.getByText('2BHK near metro in Dwarka')).toBeInTheDocument()
  })

  it('should call onSuggestionClick when chip is clicked', async () => {
    const user = userEvent.setup()
    render(<WelcomeMessage onSuggestionClick={mockOnSuggestionClick} citySelected={true} />)

    const chip = screen.getByText('2BHK with gym')
    await user.click(chip)

    expect(mockOnSuggestionClick).toHaveBeenCalledWith('2BHK with gym')
  })

  it('should disable suggestions when city is not selected', () => {
    render(
      <WelcomeMessage
        onSuggestionClick={mockOnSuggestionClick}
        citySelected={false}
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('should enable suggestions when city is selected', () => {
    render(
      <WelcomeMessage
        onSuggestionClick={mockOnSuggestionClick}
        citySelected={true}
        selectedCity="bangalore"
      />
    )

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled()
    })
  })

  it('should show selected city badge when city is selected', () => {
    render(
      <WelcomeMessage
        onSuggestionClick={mockOnSuggestionClick}
        citySelected={true}
        selectedCity="bangalore"
      />
    )

    expect(screen.getByText(/searching in/i)).toBeInTheDocument()
    expect(screen.getByText('Bangalore')).toBeInTheDocument()
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
