import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider, useToast } from './ToastContext'

// Test component that uses the toast context
function TestComponent() {
  const { showToast, showError, showSuccess, showInfo } = useToast()

  return (
    <div>
      <button onClick={() => showToast('success', 'Generic toast')}>Show Toast</button>
      <button onClick={() => showError('Error message')}>Show Error</button>
      <button onClick={() => showSuccess('Success message')}>Show Success</button>
      <button onClick={() => showInfo('Info message')}>Show Info</button>
    </div>
  )
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should throw error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow('useToast must be used within a ToastProvider')

    consoleSpy.mockRestore()
  })

  it('should render children', () => {
    render(
      <ToastProvider>
        <div>Child content</div>
      </ToastProvider>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })

  it('should show toast when showToast is called', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Toast'))

    expect(screen.getByText('Generic toast')).toBeInTheDocument()
  })

  it('should show error toast when showError is called', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Error'))

    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('should show success toast when showSuccess is called', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Success'))

    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('should show info toast when showInfo is called', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Info'))

    expect(screen.getByText('Info message')).toBeInTheDocument()
  })

  it('should show multiple toasts', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Error'))
    await user.click(screen.getByText('Show Success'))

    expect(screen.getByText('Error message')).toBeInTheDocument()
    expect(screen.getByText('Success message')).toBeInTheDocument()
  })

  it('should remove toast after duration', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })

    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    )

    await user.click(screen.getByText('Show Toast'))

    expect(screen.getByText('Generic toast')).toBeInTheDocument()

    // Advance past default duration (5000ms) + animation (300ms)
    act(() => {
      vi.advanceTimersByTime(5300)
    })

    expect(screen.queryByText('Generic toast')).not.toBeInTheDocument()
  })
})
