import { useCallback } from 'react'
import { useSearchStore } from '../stores/searchStore'
import { useToast } from '../components/Toast'
import type { SearchResponse, ParsedFilters } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface ApiError {
  error: boolean
  message: string
  type: string
}

function generateResponseText(
  count: number,
  filters: ParsedFilters,
  matchType: 'exact' | 'partial' | 'similar',
  relaxedFilters: string[]
): string {
  if (count === 0) {
    return "I couldn't find any properties matching your criteria. Try adjusting your search or use different terms."
  }

  // Build the search criteria description
  const parts: string[] = []

  if (filters.bhk) {
    parts.push(`${filters.bhk} BHK`)
  }

  if (filters.max_price) {
    if (filters.max_price >= 100) {
      parts.push(`under ${(filters.max_price / 100).toFixed(1)} Cr`)
    } else {
      parts.push(`under ${filters.max_price} L`)
    }
  }

  if (filters.area) {
    parts.push(`in ${filters.area}`)
  }

  if (filters.amenities && filters.amenities.length > 0) {
    parts.push(`with ${filters.amenities.join(', ')}`)
  }

  const criteria = parts.length > 0 ? parts.join(' ') : 'your search'

  // Generate message based on match type
  if (matchType === 'exact') {
    if (count === 1) {
      return `I found 1 property matching ${criteria}:`
    }
    return `I found ${count} properties matching ${criteria}:`
  }

  // For partial/similar matches, explain what was relaxed
  const relaxedDescriptions: string[] = []

  if (relaxedFilters.includes('bhk') && filters.bhk) {
    relaxedDescriptions.push(`${filters.bhk} BHK`)
  }
  if (relaxedFilters.includes('area') && filters.area) {
    relaxedDescriptions.push(`in ${filters.area}`)
  }
  if (relaxedFilters.includes('price')) {
    relaxedDescriptions.push('price range')
  }

  if (matchType === 'partial' && relaxedDescriptions.length > 0) {
    if (relaxedFilters.includes('bhk') && !relaxedFilters.includes('area') && filters.area) {
      // BHK was relaxed but area was kept
      return `I couldn't find ${filters.bhk} BHK properties in ${filters.area}, but here are ${count} other properties in the area:`
    }
    if (relaxedFilters.includes('area') && !relaxedFilters.includes('bhk') && filters.bhk) {
      // Area was relaxed but BHK was kept
      return `I couldn't find properties in ${filters.area}, but here are ${count} ${filters.bhk} BHK properties nearby:`
    }
    return `I couldn't find exact matches for ${relaxedDescriptions.join(' ')}, but here are ${count} similar properties:`
  }

  if (matchType === 'similar') {
    return `I couldn't find exact matches for ${criteria}, but here are ${count} similar properties you might like:`
  }

  return `I found ${count} properties for ${criteria}:`
}

// Whitelist of safe error messages that can be shown to users
const SAFE_ERROR_MESSAGES = new Set([
  'Invalid search query. Please try again with different terms.',
  'Too many requests. Please wait a moment and try again.',
  'Search service is temporarily unavailable. Please try again later.',
  'An unexpected error occurred. Please try again.',
  'At least 2 properties required for comparison',
  'Maximum 5 properties can be compared',
  'Property not found',
])

function sanitizeErrorMessage(message: string): string {
  // Only return the message if it's in our safe whitelist
  if (SAFE_ERROR_MESSAGES.has(message)) {
    return message
  }
  // For any other message, return a generic error to avoid leaking system details
  return 'An unexpected error occurred. Please try again.'
}

function getErrorMessage(status: number, apiError?: ApiError): string {
  // Use status code to determine the appropriate generic message
  // Don't expose raw API error messages that might contain system details
  switch (status) {
    case 400:
      // For 400 errors, only show safe validation messages
      if (apiError?.message && SAFE_ERROR_MESSAGES.has(apiError.message)) {
        return apiError.message
      }
      return 'Invalid search query. Please try again with different terms.'
    case 404:
      return 'Property not found'
    case 429:
      return 'Too many requests. Please wait a moment and try again.'
    case 503:
      return 'Search service is temporarily unavailable. Please try again later.'
    case 500:
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

export function useSearch() {
  const {
    query,
    city,
    setResults,
    setLoading,
    setError,
    addUserMessage,
    addAssistantMessage,
    setTyping,
  } = useSearchStore()

  const { showError } = useToast()

  const search = useCallback(async (searchQuery?: string, searchCity?: string) => {
    const q = searchQuery ?? query
    const c = searchCity ?? city

    if (!q.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/v1/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, city: c, limit: 10 }),
      })

      if (!response.ok) {
        let apiError: ApiError | undefined
        try {
          apiError = await response.json()
        } catch {
          // Response isn't JSON
        }
        const errorMessage = getErrorMessage(response.status, apiError)
        throw new Error(errorMessage)
      }

      const data: SearchResponse = await response.json()
      setResults(data.results, data.parsed_filters)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [query, city, setResults, setLoading, setError, showError])

  const searchWithChat = useCallback(async (searchQuery: string, searchCity?: string) => {
    const c = searchCity ?? city

    if (!searchQuery.trim()) return

    addUserMessage(searchQuery)
    setTyping(true)

    try {
      const response = await fetch(`${API_URL}/api/v1/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, city: c, limit: 10 }),
      })

      if (!response.ok) {
        let apiError: ApiError | undefined
        try {
          apiError = await response.json()
        } catch {
          // Response isn't JSON
        }
        const errorMessage = getErrorMessage(response.status, apiError)
        throw new Error(errorMessage)
      }

      const data: SearchResponse = await response.json()
      const responseText = generateResponseText(
        data.results.length,
        data.parsed_filters,
        data.match_type,
        data.relaxed_filters
      )

      addAssistantMessage(
        'properties',
        responseText,
        data.results,
        data.parsed_filters
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'

      // Show toast for network/server errors
      if (errorMessage.includes('unavailable') || errorMessage.includes('unexpected')) {
        showError(errorMessage)
      }

      addAssistantMessage(
        'error',
        `Sorry, I encountered an error: ${errorMessage}`
      )
    } finally {
      setTyping(false)
    }
  }, [city, addUserMessage, addAssistantMessage, setTyping, showError])

  return { search, searchWithChat }
}
