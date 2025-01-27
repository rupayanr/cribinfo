import { describe, it, expect, beforeEach } from 'vitest'
import { useSearchStore } from './searchStore'
import type { Property, ParsedFilters } from '../types'

// Helper to reset store between tests
const resetStore = () => {
  useSearchStore.setState({
    query: '',
    city: '',
    results: [],
    parsedFilters: null,
    isLoading: false,
    error: null,
    selectedProperty: null,
    compareList: [],
    messages: [],
    isTyping: false,
  })
}

const mockProperty: Property = {
  id: 'test-1',
  city: 'bangalore',
  title: 'Test Property',
  area: 'Whitefield',
  bhk: 2,
  sqft: 1200,
  bathrooms: 2,
  price_lakhs: 85,
  amenities: ['gym', 'parking'],
  latitude: 12.9716,
  longitude: 77.5946,
}

const mockFilters: ParsedFilters = {
  bhk: 2,
  min_price: null,
  max_price: 100,
  min_sqft: null,
  max_sqft: null,
  area: 'Whitefield',
  amenities: ['gym'],
}

describe('searchStore', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('Basic state', () => {
    it('should have correct initial state', () => {
      const state = useSearchStore.getState()
      expect(state.query).toBe('')
      expect(state.city).toBe('')
      expect(state.results).toEqual([])
      expect(state.isLoading).toBe(false)
      expect(state.error).toBeNull()
      expect(state.compareList).toEqual([])
      expect(state.messages).toEqual([])
      expect(state.isTyping).toBe(false)
    })
  })

  describe('setQuery', () => {
    it('should update query', () => {
      useSearchStore.getState().setQuery('2BHK under 1Cr')
      expect(useSearchStore.getState().query).toBe('2BHK under 1Cr')
    })
  })

  describe('setCity', () => {
    it('should update city', () => {
      useSearchStore.getState().setCity('bangalore')
      expect(useSearchStore.getState().city).toBe('bangalore')
    })

    it('should accept empty string for all cities', () => {
      useSearchStore.getState().setCity('')
      expect(useSearchStore.getState().city).toBe('')
    })
  })

  describe('setResults', () => {
    it('should update results and filters', () => {
      useSearchStore.getState().setResults([mockProperty], mockFilters)

      const state = useSearchStore.getState()
      expect(state.results).toEqual([mockProperty])
      expect(state.parsedFilters).toEqual(mockFilters)
      expect(state.error).toBeNull()
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      useSearchStore.getState().setLoading(true)
      expect(useSearchStore.getState().isLoading).toBe(true)

      useSearchStore.getState().setLoading(false)
      expect(useSearchStore.getState().isLoading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should update error and stop loading', () => {
      useSearchStore.getState().setLoading(true)
      useSearchStore.getState().setError('Something went wrong')

      const state = useSearchStore.getState()
      expect(state.error).toBe('Something went wrong')
      expect(state.isLoading).toBe(false)
    })

    it('should clear error when set to null', () => {
      useSearchStore.getState().setError('Error')
      useSearchStore.getState().setError(null)
      expect(useSearchStore.getState().error).toBeNull()
    })
  })

  describe('Compare functionality', () => {
    it('should add property to compare list', () => {
      useSearchStore.getState().addToCompare(mockProperty)
      expect(useSearchStore.getState().compareList).toContainEqual(mockProperty)
    })

    it('should not add duplicate properties', () => {
      useSearchStore.getState().addToCompare(mockProperty)
      useSearchStore.getState().addToCompare(mockProperty)
      expect(useSearchStore.getState().compareList).toHaveLength(1)
    })

    it('should not exceed 5 properties', () => {
      for (let i = 0; i < 7; i++) {
        useSearchStore.getState().addToCompare({
          ...mockProperty,
          id: `test-${i}`,
        })
      }
      expect(useSearchStore.getState().compareList).toHaveLength(5)
    })

    it('should remove property from compare list', () => {
      useSearchStore.getState().addToCompare(mockProperty)
      useSearchStore.getState().removeFromCompare(mockProperty.id)
      expect(useSearchStore.getState().compareList).toHaveLength(0)
    })

    it('should clear all compare items', () => {
      useSearchStore.getState().addToCompare(mockProperty)
      useSearchStore.getState().addToCompare({ ...mockProperty, id: 'test-2' })
      useSearchStore.getState().clearCompare()
      expect(useSearchStore.getState().compareList).toHaveLength(0)
    })
  })

  describe('Chat functionality', () => {
    it('should add user message', () => {
      const messageId = useSearchStore.getState().addUserMessage('2BHK under 1Cr')

      const state = useSearchStore.getState()
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0].id).toBe(messageId)
      expect(state.messages[0].role).toBe('user')
      expect(state.messages[0].contentType).toBe('text')
      expect(state.messages[0].text).toBe('2BHK under 1Cr')
    })

    it('should add assistant message with properties', () => {
      const messageId = useSearchStore
        .getState()
        .addAssistantMessage('properties', 'Found 1 property', [mockProperty], mockFilters)

      const state = useSearchStore.getState()
      expect(state.messages).toHaveLength(1)
      expect(state.messages[0].id).toBe(messageId)
      expect(state.messages[0].role).toBe('assistant')
      expect(state.messages[0].contentType).toBe('properties')
      expect(state.messages[0].properties).toEqual([mockProperty])
      expect(state.messages[0].filters).toEqual(mockFilters)
      expect(state.results).toEqual([mockProperty])
    })

    it('should add error message', () => {
      useSearchStore.getState().addAssistantMessage('error', 'Something went wrong')

      const state = useSearchStore.getState()
      expect(state.messages[0].contentType).toBe('error')
      expect(state.messages[0].text).toBe('Something went wrong')
    })

    it('should update message', () => {
      const messageId = useSearchStore.getState().addUserMessage('Original')
      useSearchStore.getState().updateMessage(messageId, { text: 'Updated' })

      expect(useSearchStore.getState().messages[0].text).toBe('Updated')
    })

    it('should set typing state', () => {
      useSearchStore.getState().setTyping(true)
      expect(useSearchStore.getState().isTyping).toBe(true)

      useSearchStore.getState().setTyping(false)
      expect(useSearchStore.getState().isTyping).toBe(false)
    })

    it('should clear chat', () => {
      useSearchStore.getState().addUserMessage('Test')
      useSearchStore.getState().setResults([mockProperty], mockFilters)
      useSearchStore.getState().clearChat()

      const state = useSearchStore.getState()
      expect(state.messages).toHaveLength(0)
      expect(state.results).toHaveLength(0)
      expect(state.parsedFilters).toBeNull()
    })
  })

  describe('selectProperty', () => {
    it('should set selected property', () => {
      useSearchStore.getState().selectProperty(mockProperty)
      expect(useSearchStore.getState().selectedProperty).toEqual(mockProperty)
    })

    it('should clear selected property', () => {
      useSearchStore.getState().selectProperty(mockProperty)
      useSearchStore.getState().selectProperty(null)
      expect(useSearchStore.getState().selectedProperty).toBeNull()
    })
  })
})
