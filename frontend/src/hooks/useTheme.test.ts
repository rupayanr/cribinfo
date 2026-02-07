import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

// Mock matchMedia
const matchMediaMock = vi.fn((query: string) => ({
  matches: query.includes('dark'),
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}))

describe('useTheme', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', localStorageMock)
    vi.stubGlobal('matchMedia', matchMediaMock)
    localStorageMock.clear()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should return light theme by default when no preference', async () => {
    matchMediaMock.mockReturnValueOnce({
      matches: false,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(result.current.isDark).toBe(false)
  })

  it('should return stored theme from localStorage', async () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(result.current.isDark).toBe(true)
  })

  it('should toggle theme from light to dark', async () => {
    localStorageMock.getItem.mockReturnValueOnce('light')

    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')

    act(() => {
      result.current.toggle()
    })

    expect(result.current.theme).toBe('dark')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('should toggle theme from dark to light', async () => {
    localStorageMock.getItem.mockReturnValueOnce('dark')

    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')

    act(() => {
      result.current.toggle()
    })

    expect(result.current.theme).toBe('light')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('should provide toggle function', async () => {
    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())

    expect(typeof result.current.toggle).toBe('function')
  })

  it('should use system preference when no stored theme', async () => {
    localStorageMock.getItem.mockReturnValueOnce(null)
    matchMediaMock.mockReturnValueOnce({
      matches: true, // prefers dark
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })

    const { useTheme } = await import('./useTheme')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
  })
})
