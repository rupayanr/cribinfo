import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock MermaidDiagram component
vi.mock('../components/Docs/MermaidDiagram', () => ({
  MermaidDiagram: ({ chart }: { chart: string }) => (
    <div data-testid="mermaid-diagram" data-chart={chart.substring(0, 50)}>
      Mermaid Diagram
    </div>
  ),
}))

// Mock data
vi.mock('../data/diagrams', () => ({
  diagrams: {
    systemArchitecture: 'graph TB; System Architecture',
    backendArchitecture: 'graph TB; Backend Architecture',
    ragPipeline: 'sequenceDiagram; RAG Pipeline',
    searchStrategy: 'flowchart TD; Search Strategy',
    stateManagement: 'graph TD; State Management',
    deploymentArchitecture: 'graph TD; Deployment',
    componentTree: 'graph TD; Component Tree',
    databaseSchema: 'erDiagram; Database Schema',
    errorHandling: 'flowchart TD; Error Handling',
  },
}))

vi.mock('../data/components', () => ({
  componentCatalog: [
    { name: 'App', path: 'src/App.tsx', description: 'Root component' },
    { name: 'Header', path: 'src/components/Layout/Header.tsx', description: 'Top bar' },
  ],
}))

vi.mock('../data/api-endpoints', () => ({
  apiEndpoints: [
    { method: 'POST', path: '/api/v1/search', description: 'Property search' },
    { method: 'GET', path: '/api/v1/cities', description: 'List cities' },
  ],
}))

// Import after mocks
import { ArchitecturePage } from './ArchitecturePage'

// Helper to get sidebar navigation buttons (desktop version)
const getSidebarButton = (name: string) => {
  const sidebar = document.querySelector('nav')
  return sidebar ? within(sidebar).getByRole('button', { name }) : null
}

describe('ArchitecturePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render navigation sidebar with all sections', () => {
    render(<ArchitecturePage />)

    // Check that all buttons exist (they appear twice - mobile and desktop)
    expect(screen.getAllByRole('button', { name: 'System Architecture' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('button', { name: 'RAG Pipeline' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('button', { name: 'Search Strategy' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('button', { name: 'Component Tree' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('button', { name: 'DB Schema' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('button', { name: 'Component Catalog' }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByRole('button', { name: 'API Endpoints' }).length).toBeGreaterThanOrEqual(1)
  })

  it('should show System Architecture (HLD) by default', () => {
    render(<ArchitecturePage />)

    expect(screen.getByText('System Architecture (HLD)')).toBeInTheDocument()
    expect(screen.getByText(/high-level overview/i)).toBeInTheDocument()
  })

  it('should render MermaidDiagram for HLD section', () => {
    render(<ArchitecturePage />)

    const diagram = screen.getByTestId('mermaid-diagram')
    expect(diagram).toBeInTheDocument()
  })

  it('should switch to RAG Pipeline on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    // Click the first button (from sidebar or mobile tabs)
    await user.click(screen.getAllByRole('button', { name: 'RAG Pipeline' })[0])

    expect(screen.getByText('RAG Pipeline Flow')).toBeInTheDocument()
    expect(screen.getByText(/sequence diagram/i)).toBeInTheDocument()
  })

  it('should switch to Search Strategy on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Search Strategy' })[0])

    expect(screen.getByText('Search Strategy (Filter Relaxation)')).toBeInTheDocument()
    expect(screen.getByText(/progressively relaxes filters/i)).toBeInTheDocument()
  })

  it('should switch to Component Tree on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Component Tree' })[0])

    expect(screen.getByText('Frontend Component Tree')).toBeInTheDocument()
    expect(screen.getByText(/visual hierarchy/i)).toBeInTheDocument()
  })

  it('should switch to DB Schema on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'DB Schema' })[0])

    expect(screen.getByText('Database Schema')).toBeInTheDocument()
    expect(screen.getByText(/postgresql table structure/i)).toBeInTheDocument()
  })

  it('should switch to Component Catalog on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Component Catalog' })[0])

    expect(screen.getByRole('heading', { name: 'Component Catalog' })).toBeInTheDocument()
    expect(screen.getByText(/all react components/i)).toBeInTheDocument()
  })

  it('should render component catalog table', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Component Catalog' })[0])

    // Check table headers
    expect(screen.getByText('Component')).toBeInTheDocument()
    expect(screen.getByText('Path')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()

    // Check table content
    expect(screen.getByText('App')).toBeInTheDocument()
    expect(screen.getByText('src/App.tsx')).toBeInTheDocument()
    expect(screen.getByText('Root component')).toBeInTheDocument()
  })

  it('should switch to API Endpoints on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'API Endpoints' })[0])

    expect(screen.getByRole('heading', { name: 'API Endpoints' })).toBeInTheDocument()
    expect(screen.getByText(/all rest api endpoints/i)).toBeInTheDocument()
  })

  it('should render API endpoints table', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'API Endpoints' })[0])

    // Check table headers
    expect(screen.getByText('Method')).toBeInTheDocument()
    expect(screen.getAllByText('Path')[0]).toBeInTheDocument()

    // Check table content
    expect(screen.getByText('POST')).toBeInTheDocument()
    expect(screen.getByText('/api/v1/search')).toBeInTheDocument()
    expect(screen.getByText('Property search')).toBeInTheDocument()
  })

  it('should highlight active section in sidebar', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    // Default active section should be highlighted (get sidebar button)
    const hldButtons = screen.getAllByRole('button', { name: 'System Architecture' })
    // At least one should have the active class
    expect(hldButtons.some(btn => btn.classList.contains('bg-blue-50') || btn.classList.contains('bg-blue-100'))).toBe(true)

    // Switch to another section
    await user.click(screen.getAllByRole('button', { name: 'RAG Pipeline' })[0])
    const ragButtons = screen.getAllByRole('button', { name: 'RAG Pipeline' })
    // At least one should now have the active class
    expect(ragButtons.some(btn => btn.classList.contains('bg-blue-50') || btn.classList.contains('bg-blue-100'))).toBe(true)
  })

  it('should style GET methods with green badge', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'API Endpoints' })[0])

    const getMethod = screen.getByText('GET')
    expect(getMethod).toHaveClass('bg-green-100')
  })

  it('should style POST methods with blue badge', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'API Endpoints' })[0])

    const postMethod = screen.getByText('POST')
    expect(postMethod).toHaveClass('bg-blue-100')
  })

  it('should switch to Backend Modules on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Backend Modules' })[0])

    expect(screen.getByText('Backend Module Architecture')).toBeInTheDocument()
    expect(screen.getByText(/Python module organization/i)).toBeInTheDocument()
  })

  it('should switch to State Management on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'State Management' })[0])

    expect(screen.getByText('State Management (Zustand)')).toBeInTheDocument()
    expect(screen.getByText(/searchStore centralizes/i)).toBeInTheDocument()
  })

  it('should switch to Deployment on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Deployment' })[0])

    expect(screen.getByText('Deployment Architecture')).toBeInTheDocument()
    expect(screen.getByText(/Production infrastructure/i)).toBeInTheDocument()
  })

  it('should switch to Error Handling on click', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    await user.click(screen.getAllByRole('button', { name: 'Error Handling' })[0])

    expect(screen.getByText('Error Handling Flow')).toBeInTheDocument()
    expect(screen.getByText(/Error propagation/i)).toBeInTheDocument()
  })

  it('should display footer with author credit', () => {
    render(<ArchitecturePage />)

    // Text is split across elements, so look for parts separately
    expect(screen.getByText('Claude')).toBeInTheDocument()
    expect(screen.getByText('Rupayan Roy')).toBeInTheDocument()
  })

  it('should render mobile tabs', () => {
    render(<ArchitecturePage />)

    // Mobile tabs should have whitespace-nowrap class
    const mobileTabs = document.querySelector('.overflow-x-auto')
    expect(mobileTabs).toBeInTheDocument()
  })

  it('should navigate using mobile tabs', async () => {
    const user = userEvent.setup()
    render(<ArchitecturePage />)

    // Find all navigation buttons (includes both desktop and mobile)
    const ragButtons = screen.getAllByRole('button', { name: 'RAG Pipeline' })

    // Click any of them (mobile or desktop)
    await user.click(ragButtons[ragButtons.length - 1])

    expect(screen.getByText('RAG Pipeline Flow')).toBeInTheDocument()
  })
})
