import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// Mock SwaggerUI
vi.mock('swagger-ui-react', () => ({
  default: ({ url }: { url: string }) => (
    <div data-testid="swagger-ui" data-url={url}>
      Swagger UI Component
    </div>
  ),
}))

// Mock CSS import
vi.mock('swagger-ui-react/swagger-ui.css', () => ({}))

// Import after mocks
import { DocsPage } from './DocsPage'

describe('DocsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render page title', () => {
    render(<DocsPage />)
    expect(screen.getByRole('heading', { name: 'API Documentation' })).toBeInTheDocument()
  })

  it('should render page description', () => {
    render(<DocsPage />)
    expect(screen.getByText(/interactive api reference powered by openapi/i)).toBeInTheDocument()
    expect(screen.getByText(/try endpoints directly from this page/i)).toBeInTheDocument()
  })

  it('should render SwaggerUI component', () => {
    render(<DocsPage />)
    expect(screen.getByTestId('swagger-ui')).toBeInTheDocument()
  })

  it('should pass openapi.json URL to SwaggerUI', () => {
    render(<DocsPage />)
    const swagger = screen.getByTestId('swagger-ui')
    // URL should end with /openapi.json
    expect(swagger.getAttribute('data-url')).toMatch(/\/openapi\.json$/)
  })

  it('should have correct main element styling', () => {
    render(<DocsPage />)
    const main = screen.getByRole('main')
    expect(main).toHaveClass('flex-1')
    expect(main).toHaveClass('overflow-y-auto')
  })

  it('should have max-width container', () => {
    const { container } = render(<DocsPage />)
    const maxWidthContainer = container.querySelector('.max-w-6xl')
    expect(maxWidthContainer).toBeInTheDocument()
  })

  it('should have border around SwaggerUI', () => {
    const { container } = render(<DocsPage />)
    const borderContainer = container.querySelector('.border.border-gray-200')
    expect(borderContainer).toBeInTheDocument()
  })

  it('should have rounded corners on SwaggerUI container', () => {
    const { container } = render(<DocsPage />)
    const roundedContainer = container.querySelector('.rounded-xl')
    expect(roundedContainer).toBeInTheDocument()
  })
})
