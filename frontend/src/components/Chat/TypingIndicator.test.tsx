import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TypingIndicator } from './TypingIndicator'

describe('TypingIndicator', () => {
  it('should render typing indicator', () => {
    render(<TypingIndicator />)

    // Check for the container
    const indicator = screen.getByTestId('typing-indicator')
    expect(indicator).toBeInTheDocument()
  })

  it('should render three animated dots', () => {
    render(<TypingIndicator />)

    const dots = screen.getAllByTestId('typing-dot')
    expect(dots).toHaveLength(3)
  })
})
