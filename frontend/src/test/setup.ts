import '@testing-library/jest-dom'

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:8000',
  },
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// Mock scrollIntoView
Element.prototype.scrollIntoView = () => {}

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock
