import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

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
})
