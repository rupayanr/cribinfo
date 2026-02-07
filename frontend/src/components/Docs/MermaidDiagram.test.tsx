import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock useTheme - must be at top level without variable references
vi.mock('../../hooks/useTheme', () => ({
  useTheme: vi.fn(() => ({
    isDark: false,
    toggle: vi.fn(),
  })),
}))

// Mock mermaid - must be at top level without variable references
vi.mock('mermaid', () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn().mockResolvedValue({ svg: '<svg>Test SVG</svg>' }),
  },
}))

// Import after mocks
import { MermaidDiagram } from './MermaidDiagram'
import mermaid from 'mermaid'
import { useTheme } from '../../hooks/useTheme'

describe('MermaidDiagram', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg>Test SVG</svg>' })
    vi.mocked(useTheme).mockReturnValue({ isDark: false, toggle: vi.fn() })
  })

  it('should render container', () => {
    render(<MermaidDiagram chart="graph TD; A-->B" />)
    const container = document.querySelector('.rounded-xl')
    expect(container).toBeInTheDocument()
  })

  it('should initialize mermaid with correct config', async () => {
    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(mermaid.initialize).toHaveBeenCalledWith({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'strict',
      })
    })
  })

  it('should call mermaid render with chart', async () => {
    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledWith(
        expect.stringMatching(/^mermaid-\d+$/),
        'graph TD; A-->B'
      )
    })
  })

  it('should render SVG when mermaid succeeds', async () => {
    vi.mocked(mermaid.render).mockResolvedValue({ svg: '<svg data-testid="rendered-svg">Test SVG Content</svg>' })

    const { container } = render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  it('should show error message when mermaid fails', async () => {
    vi.mocked(mermaid.render).mockRejectedValue(new Error('Invalid syntax'))

    render(<MermaidDiagram chart="invalid chart" />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to render diagram/i)).toBeInTheDocument()
      expect(screen.getByText(/Invalid syntax/i)).toBeInTheDocument()
    })
  })

  it('should show generic error for non-Error objects', async () => {
    vi.mocked(mermaid.render).mockRejectedValue('Some string error')

    render(<MermaidDiagram chart="invalid chart" />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to render diagram/i)).toBeInTheDocument()
    })
  })

  it('should use dark theme when isDark is true', async () => {
    vi.mocked(useTheme).mockReturnValue({ isDark: true, toggle: vi.fn() })

    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(mermaid.initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: 'dark',
        })
      )
    })
  })

  it('should re-render when chart changes', async () => {
    const { rerender } = render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(1)
    })

    rerender(<MermaidDiagram chart="graph TD; C-->D" />)

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(2)
      expect(mermaid.render).toHaveBeenLastCalledWith(
        expect.stringMatching(/^mermaid-\d+$/),
        'graph TD; C-->D'
      )
    })
  })

  it('should re-render when theme changes', async () => {
    vi.mocked(useTheme).mockReturnValue({ isDark: false, toggle: vi.fn() })

    const { rerender } = render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(1)
    })

    vi.mocked(useTheme).mockReturnValue({ isDark: true, toggle: vi.fn() })
    rerender(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(mermaid.render).toHaveBeenCalledTimes(2)
    })
  })

  it('should have correct styling for error state', async () => {
    vi.mocked(mermaid.render).mockRejectedValue(new Error('Syntax error'))

    const { container } = render(<MermaidDiagram chart="invalid" />)

    await waitFor(() => {
      // Find the error div by its text content
      const errorDiv = container.querySelector('.bg-red-50')
      expect(errorDiv).toBeInTheDocument()
      expect(errorDiv).toHaveClass('border-red-200')
      expect(errorDiv).toHaveTextContent('Failed to render diagram')
    })
  })

  it('should have overflow-hidden for zoomable container', () => {
    const { container } = render(<MermaidDiagram chart="graph TD; A-->B" />)
    const diagramContainer = container.querySelector('.overflow-hidden')
    expect(diagramContainer).toBeInTheDocument()
  })

  it('should render zoom controls', async () => {
    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByTitle('Zoom in')).toBeInTheDocument()
      expect(screen.getByTitle('Zoom out')).toBeInTheDocument()
      expect(screen.getByTitle('Reset zoom')).toBeInTheDocument()
    })
  })

  it('should display 100% zoom by default', async () => {
    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  it('should show help text at default zoom', async () => {
    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText(/Ctrl\/Cmd \+ scroll to zoom/i)).toBeInTheDocument()
    })
  })

  it('should handle zoom in button click', async () => {
    const user = userEvent.setup()

    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    const zoomInBtn = screen.getByTitle('Zoom in')
    await user.click(zoomInBtn)

    expect(screen.getByText('125%')).toBeInTheDocument()
  })

  it('should handle zoom out button click', async () => {
    const user = userEvent.setup()

    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    const zoomOutBtn = screen.getByTitle('Zoom out')
    await user.click(zoomOutBtn)

    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('should handle reset button click', async () => {
    const user = userEvent.setup()

    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    // First zoom in
    const zoomInBtn = screen.getByTitle('Zoom in')
    await user.click(zoomInBtn)
    expect(screen.getByText('125%')).toBeInTheDocument()

    // Then reset
    const resetBtn = screen.getByTitle('Reset zoom')
    await user.click(resetBtn)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it('should disable zoom out at minimum zoom', async () => {
    const user = userEvent.setup()

    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    const zoomOutBtn = screen.getByTitle('Zoom out')

    // Zoom out to minimum (50%)
    await user.click(zoomOutBtn) // 75%
    await user.click(zoomOutBtn) // 50%

    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(zoomOutBtn).toBeDisabled()
  })

  it('should disable zoom in at maximum zoom', async () => {
    const user = userEvent.setup()

    render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    const zoomInBtn = screen.getByTitle('Zoom in')

    // Zoom in to maximum (300%)
    for (let i = 0; i < 8; i++) {
      await user.click(zoomInBtn)
    }

    expect(screen.getByText('300%')).toBeInTheDocument()
    expect(zoomInBtn).toBeDisabled()
  })

  it('should reset zoom when chart changes', async () => {
    const user = userEvent.setup()

    const { rerender } = render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    // Zoom in
    const zoomInBtn = screen.getByTitle('Zoom in')
    await user.click(zoomInBtn)
    expect(screen.getByText('125%')).toBeInTheDocument()

    // Change chart
    rerender(<MermaidDiagram chart="graph TD; C-->D" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })
  })

  it('should show cursor-grab when zoomed in', async () => {
    const user = userEvent.setup()

    const { container } = render(<MermaidDiagram chart="graph TD; A-->B" />)

    await waitFor(() => {
      expect(screen.getByText('100%')).toBeInTheDocument()
    })

    // Zoom in
    const zoomInBtn = screen.getByTitle('Zoom in')
    await user.click(zoomInBtn)

    const diagramContainer = container.querySelector('.cursor-grab')
    expect(diagramContainer).toBeInTheDocument()
  })
})
