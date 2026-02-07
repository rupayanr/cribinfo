import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toast } from './Toast'

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render success toast', () => {
    render(<Toast type="success" message="Operation successful" onClose={vi.fn()} />)
    expect(screen.getByText('Operation successful')).toBeInTheDocument()
  })

  it('should render error toast', () => {
    render(<Toast type="error" message="Something went wrong" onClose={vi.fn()} />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should render info toast', () => {
    render(<Toast type="info" message="Information message" onClose={vi.fn()} />)
    expect(screen.getByText('Information message')).toBeInTheDocument()
  })

  it('should render warning toast', () => {
    render(<Toast type="warning" message="Warning message" onClose={vi.fn()} />)
    expect(screen.getByText('Warning message')).toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onClose = vi.fn()

    render(<Toast type="success" message="Test" onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    await user.click(closeButton)

    // Wait for animation timeout
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('should auto-dismiss after duration', async () => {
    const onClose = vi.fn()

    render(<Toast type="success" message="Test" duration={3000} onClose={onClose} />)

    // Fast forward past duration
    act(() => {
      vi.advanceTimersByTime(3000)
    })

    // Wait for animation timeout
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('should use default duration of 5000ms', async () => {
    const onClose = vi.fn()

    render(<Toast type="success" message="Test" onClose={onClose} />)

    // Before default duration
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(onClose).not.toHaveBeenCalled()

    // After default duration
    act(() => {
      vi.advanceTimersByTime(1000)
    })

    // Wait for animation
    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(onClose).toHaveBeenCalled()
  })

  it('should have correct styling for each type', () => {
    const { rerender } = render(<Toast type="success" message="Test" onClose={vi.fn()} />)
    expect(screen.getByText('Test').parentElement).toHaveClass('bg-green-50')

    rerender(<Toast type="error" message="Test" onClose={vi.fn()} />)
    expect(screen.getByText('Test').parentElement).toHaveClass('bg-red-50')

    rerender(<Toast type="info" message="Test" onClose={vi.fn()} />)
    expect(screen.getByText('Test').parentElement).toHaveClass('bg-blue-50')

    rerender(<Toast type="warning" message="Test" onClose={vi.fn()} />)
    expect(screen.getByText('Test').parentElement).toHaveClass('bg-yellow-50')
  })
})
