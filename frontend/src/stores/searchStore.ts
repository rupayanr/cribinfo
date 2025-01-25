import { create } from 'zustand'
import type { Property, ParsedFilters, ChatMessage, MessageContentType } from '../types'

interface SearchState {
  query: string
  city: string
  results: Property[]
  parsedFilters: ParsedFilters | null
  isLoading: boolean
  error: string | null
  selectedProperty: Property | null
  compareList: Property[]
  messages: ChatMessage[]
  isTyping: boolean

  setQuery: (query: string) => void
  setCity: (city: string) => void
  setResults: (results: Property[], filters: ParsedFilters) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  selectProperty: (property: Property | null) => void
  addToCompare: (property: Property) => void
  removeFromCompare: (propertyId: string) => void
  clearCompare: () => void
  addUserMessage: (content: string) => string
  addAssistantMessage: (
    contentType: MessageContentType,
    text: string,
    properties?: Property[],
    filters?: ParsedFilters
  ) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  setTyping: (isTyping: boolean) => void
  clearChat: () => void
}

const generateId = () => Math.random().toString(36).substring(2, 9)

export const useSearchStore = create<SearchState>((set) => ({
  query: '',
  city: '',  // Empty means all cities
  results: [],
  parsedFilters: null,
  isLoading: false,
  error: null,
  selectedProperty: null,
  compareList: [],
  messages: [],
  isTyping: false,

  setQuery: (query) => set({ query }),
  setCity: (city) => set({ city }),
  setResults: (results, parsedFilters) => set({ results, parsedFilters, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  selectProperty: (selectedProperty) => set({ selectedProperty }),
  addToCompare: (property) =>
    set((state) => {
      if (state.compareList.length >= 5) return state
      if (state.compareList.find((p) => p.id === property.id)) return state
      return { compareList: [...state.compareList, property] }
    }),
  removeFromCompare: (propertyId) =>
    set((state) => ({
      compareList: state.compareList.filter((p) => p.id !== propertyId),
    })),
  clearCompare: () => set({ compareList: [] }),

  addUserMessage: (content) => {
    const id = generateId()
    const message: ChatMessage = {
      id,
      role: 'user',
      contentType: 'text',
      text: content,
      timestamp: new Date(),
    }
    set((state) => ({ messages: [...state.messages, message] }))
    return id
  },

  addAssistantMessage: (contentType, text, properties, filters) => {
    const id = generateId()
    const message: ChatMessage = {
      id,
      role: 'assistant',
      contentType,
      text,
      properties,
      filters,
      timestamp: new Date(),
    }
    set((state) => ({
      messages: [...state.messages, message],
      results: properties || state.results,
      parsedFilters: filters || state.parsedFilters,
    }))
    return id
  },

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),

  setTyping: (isTyping) => set({ isTyping }),

  clearChat: () => set({ messages: [], results: [], parsedFilters: null }),
}))
