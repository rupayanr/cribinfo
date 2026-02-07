import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatInput } from './ChatInput'

describe('ChatInput', () => {
  const mockOnSend = vi.fn()

  beforeEach(() => {
    mockOnSend.mockClear()
  })

  it('should render input and send button', () => {
    render(<ChatInput onSend={mockOnSend} />)

    expect(screen.getByPlaceholderText(/2BHK under 1Cr/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })

  it('should call onSend when form is submitted with text', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i)
    await user.type(input, '2BHK under 1Cr')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockOnSend).toHaveBeenCalledWith('2BHK under 1Cr')
  })

  it('should clear input after sending', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i) as HTMLInputElement
    await user.type(input, '2BHK under 1Cr')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(input.value).toBe('')
  })

  it('should not call onSend when input is empty', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('should not call onSend when input is only whitespace', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i)
    await user.type(input, '   ')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<ChatInput onSend={mockOnSend} disabled />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i)
    const button = screen.getByRole('button', { name: /search/i })

    expect(input).toBeDisabled()
    expect(button).toBeDisabled()
  })

  it('should submit on Enter key press', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i)
    await user.type(input, '3BHK in Whitefield{enter}')

    expect(mockOnSend).toHaveBeenCalledWith('3BHK in Whitefield')
  })

  it('should trim whitespace from input', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i)
    await user.type(input, '  2BHK under 1Cr  ')
    await user.click(screen.getByRole('button', { name: /search/i }))

    expect(mockOnSend).toHaveBeenCalledWith('2BHK under 1Cr')
  })

  it('should render city selection prompt when city is not selected', () => {
    render(<ChatInput onSend={mockOnSend} citySelected={false} />)
    expect(screen.getByText(/select a city to start/i)).toBeInTheDocument()
  })

  it('should call onSelectCity when city selection button is clicked', async () => {
    const user = userEvent.setup()
    const mockOnSelectCity = vi.fn()

    render(<ChatInput onSend={mockOnSend} citySelected={false} onSelectCity={mockOnSelectCity} />)

    const selectCityButton = screen.getByText(/select a city to start/i).closest('button')
    await user.click(selectCityButton!)

    expect(mockOnSelectCity).toHaveBeenCalled()
  })

  it('should show helper text with suggestions', () => {
    render(<ChatInput onSend={mockOnSend} citySelected={true} />)
    expect(screen.getByText(/try:/i)).toBeInTheDocument()
  })

  it('should not submit on Shift+Enter', async () => {
    const user = userEvent.setup()
    render(<ChatInput onSend={mockOnSend} />)

    const input = screen.getByPlaceholderText(/2BHK under 1Cr/i)
    await user.type(input, '3BHK in Whitefield')
    await user.keyboard('{Shift>}{Enter}{/Shift}')

    expect(mockOnSend).not.toHaveBeenCalled()
  })

  it('should disable input when city is not selected', () => {
    render(<ChatInput onSend={mockOnSend} citySelected={false} />)

    // When city is not selected, the input is replaced with city selection prompt
    expect(screen.queryByPlaceholderText(/2BHK under 1Cr/i)).not.toBeInTheDocument()
  })
})
