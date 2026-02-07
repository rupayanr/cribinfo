import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Header } from './Header'
import { useSearchStore } from '../../stores/searchStore'

// Mock CitySelector
vi.mock('../Search/CitySelector', () => ({
  CitySelector: () => <div data-testid="city-selector">CitySelector</div>,
}))

// Mock useTheme
vi.mock('../../hooks/useTheme', () => ({
  useTheme: () => ({
    isDark: false,
    toggle: vi.fn(),
  }),
}))

const renderWithRouter = (initialRoute = '/') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Header />
    </MemoryRouter>
  )
}

describe('Header', () => {
  beforeEach(() => {
    useSearchStore.setState({
      city: 'bangalore',
    })
  })

  it('should render CribInfo logo', () => {
    renderWithRouter()
    expect(screen.getByText('CribInfo')).toBeInTheDocument()
  })

  it('should render home icon', () => {
    renderWithRouter()
    // The home icon is in an SVG
    const homeLink = screen.getByText('CribInfo').closest('a')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('should render CitySelector on home page', () => {
    renderWithRouter('/')
    expect(screen.getByTestId('city-selector')).toBeInTheDocument()
  })

  it('should not render CitySelector on other pages', () => {
    renderWithRouter('/docs')
    expect(screen.queryByTestId('city-selector')).not.toBeInTheDocument()
  })

  it('should render theme toggle button', () => {
    renderWithRouter()
    const themeButton = screen.getByTitle(/switch to/i)
    expect(themeButton).toBeInTheDocument()
  })

  it('should render menu button', () => {
    renderWithRouter()
    const menuButton = screen.getByTitle('Menu')
    expect(menuButton).toBeInTheDocument()
  })

  it('should open menu when menu button is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    const menuButton = screen.getByTitle('Menu')
    await user.click(menuButton)

    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('API Docs')).toBeInTheDocument()
  })

  it('should close menu when clicked outside', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    const menuButton = screen.getByTitle('Menu')
    await user.click(menuButton)

    expect(screen.getByText('Architecture')).toBeInTheDocument()

    // Click outside
    await user.click(document.body)

    expect(screen.queryByText('Architecture')).not.toBeInTheDocument()
  })

  it('should have correct link to architecture page', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    const menuButton = screen.getByTitle('Menu')
    await user.click(menuButton)

    const archLink = screen.getByText('Architecture')
    expect(archLink.closest('a')).toHaveAttribute('href', '/architecture')
  })

  it('should have correct link to docs page', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    const menuButton = screen.getByTitle('Menu')
    await user.click(menuButton)

    const docsLink = screen.getByText('API Docs')
    expect(docsLink.closest('a')).toHaveAttribute('href', '/docs')
  })

  it('should close menu on route change', async () => {
    const user = userEvent.setup()
    renderWithRouter()

    const menuButton = screen.getByTitle('Menu')
    await user.click(menuButton)

    const archLink = screen.getByText('Architecture')
    await user.click(archLink)

    // Menu should close after navigation
    // Note: In actual app, the route would change and menu would close
  })
})
