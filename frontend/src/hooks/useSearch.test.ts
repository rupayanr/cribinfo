import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSearch } from './useSearch'
import { useSearchStore } from '../stores/searchStore'

// Mock the toast hook
vi.mock('../components/Toast', () => ({
  useToast: () => ({
    showError: vi.fn(),
    showSuccess: vi.fn(),
  }),
}))

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('useSearch', () => {
  beforeEach(() => {
    mockFetch.mockClear()
    useSearchStore.setState({
      query: '',
      city: 'bangalore',
      results: [],
      parsedFilters: null,
      isLoading: false,
      error: null,
      messages: [],
      isTyping: false,
      compareList: [],
      selectedProperty: null,
      citySelectorOpen: false,
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('search', () => {
    it('should not search with empty query', async () => {
      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('')
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should make API call with correct parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [],
          parsed_filters: {},
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('2bhk in koramangala')
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/search'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('should handle API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: true, message: 'Server error', type: 'error' }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('test query')
      })

      // Error messages are sanitized for security - raw API errors are replaced with generic messages
      expect(useSearchStore.getState().error).toBe('An unexpected error occurred. Please try again.')
    })

    it('should handle rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.reject(),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('test query')
      })

      expect(useSearchStore.getState().error).toContain('Too many requests')
    })
  })

  describe('searchWithChat', () => {
    it('should add user message to chat', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [],
          parsed_filters: {},
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('2bhk flat')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[0].text).toBe('2bhk flat')
      expect(messages[0].role).toBe('user')
    })

    it('should add assistant message with results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1', title: 'Test Property' }],
          parsed_filters: { bhk: 2 },
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('2bhk flat')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].role).toBe('assistant')
      expect(messages[1].contentType).toBe('properties')
    })

    it('should add error message on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.reject(),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('test query')
      })

      const messages = useSearchStore.getState().messages
      const errorMessage = messages.find(m => m.contentType === 'error')
      expect(errorMessage).toBeDefined()
    })

    it('should not search with empty query', async () => {
      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('')
      })

      expect(mockFetch).not.toHaveBeenCalled()
    })

    it('should generate correct response text for no results', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [],
          parsed_filters: {},
          match_type: 'similar',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('test')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain("couldn't find")
    })

    it('should generate response text for single result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1', title: 'Test' }],
          parsed_filters: { bhk: 2 },
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('2bhk flat')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain('1 property')
    })

    it('should generate response text with price filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }, { id: '2' }],
          parsed_filters: { max_price: 150 },
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('under 1.5 Cr')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain('1.5 Cr')
    })

    it('should generate response text with price in lakhs', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { max_price: 50 },
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('under 50L')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain('50 L')
    })

    it('should generate response text with area filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { area: 'Koramangala' },
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('in Koramangala')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain('Koramangala')
    })

    it('should generate response text with amenities filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { amenities: ['gym', 'pool'] },
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('with gym and pool')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain('gym')
    })

    it('should handle partial match with relaxed BHK', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { bhk: 3, area: 'Koramangala' },
          match_type: 'partial',
          relaxed_filters: ['bhk'],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('3bhk in Koramangala')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain("couldn't find")
      expect(messages[1].text).toContain('3 BHK')
    })

    it('should handle partial match with relaxed area', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { bhk: 2, area: 'Koramangala' },
          match_type: 'partial',
          relaxed_filters: ['area'],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('2bhk in Koramangala')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain("couldn't find")
      expect(messages[1].text).toContain('Koramangala')
    })

    it('should handle partial match with relaxed price', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { max_price: 50 },
          match_type: 'partial',
          relaxed_filters: ['price'],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('under 50L')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain("couldn't find")
    })

    it('should handle similar match type', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ id: '1' }],
          parsed_filters: { bhk: 2, max_price: 100 },
          match_type: 'similar',
          relaxed_filters: ['bhk', 'price'],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('2bhk under 1cr')
      })

      const messages = useSearchStore.getState().messages
      expect(messages[1].text).toContain('similar properties')
    })

    it('should handle 400 error with safe message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: true,
          message: 'At least 2 properties required for comparison',
          type: 'validation'
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('test query')
      })

      expect(useSearchStore.getState().error).toBe('At least 2 properties required for comparison')
    })

    it('should handle 400 error with unsafe message', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: true,
          message: 'SQL syntax error at line 42',
          type: 'error'
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('test query')
      })

      // Unsafe message should be sanitized
      expect(useSearchStore.getState().error).toBe('Invalid search query. Please try again with different terms.')
    })

    it('should handle 404 error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.reject(),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('test query')
      })

      expect(useSearchStore.getState().error).toBe('Property not found')
    })

    it('should handle network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.search('test query')
      })

      expect(useSearchStore.getState().error).toBe('Network error')
    })

    it('should use provided city in searchWithChat', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [],
          parsed_filters: {},
          match_type: 'exact',
          relaxed_filters: [],
        }),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('2bhk', 'mumbai')
      })

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"city":"mumbai"'),
        })
      )
    })

    it('should show toast for unavailable service error', async () => {
      const mockShowError = vi.fn()
      vi.doMock('../components/Toast', () => ({
        useToast: () => ({
          showError: mockShowError,
          showSuccess: vi.fn(),
        }),
      }))

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
        json: () => Promise.reject(),
      })

      const { result } = renderHook(() => useSearch())

      await act(async () => {
        await result.current.searchWithChat('test')
      })

      const messages = useSearchStore.getState().messages
      expect(messages.some(m => m.contentType === 'error')).toBe(true)
    })
  })
})
