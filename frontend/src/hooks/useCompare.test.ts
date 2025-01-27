import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCompare } from './useCompare'
import { useSearchStore } from '../stores/searchStore'
import type { Property } from '../types'

const mockProperty: Property = {
  id: 'test-1',
  city: 'bangalore',
  title: 'Test Property',
  area: 'Whitefield',
  bhk: 2,
  sqft: 1200,
  bathrooms: 2,
  price_lakhs: 85,
  amenities: ['gym'],
  latitude: 12.9716,
  longitude: 77.5946,
}

// Reset store between tests
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

describe('useCompare hook', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should return empty compare list initially', () => {
    const { result } = renderHook(() => useCompare())
    expect(result.current.compareList).toEqual([])
  })

  it('should check if property is in compare list', () => {
    const { result } = renderHook(() => useCompare())

    expect(result.current.isInCompareList(mockProperty.id)).toBe(false)

    act(() => {
      result.current.addToCompare(mockProperty)
    })

    expect(result.current.isInCompareList(mockProperty.id)).toBe(true)
  })

  it('should toggle compare correctly', () => {
    const { result } = renderHook(() => useCompare())

    // Add
    act(() => {
      result.current.toggleCompare(mockProperty)
    })
    expect(result.current.isInCompareList(mockProperty.id)).toBe(true)

    // Remove
    act(() => {
      result.current.toggleCompare(mockProperty)
    })
    expect(result.current.isInCompareList(mockProperty.id)).toBe(false)
  })

  it('should report canAddMore correctly', () => {
    const { result } = renderHook(() => useCompare())

    // Should be able to add when empty
    expect(result.current.canAddMore).toBe(true)

    // Add 5 properties
    for (let i = 0; i < 5; i++) {
      act(() => {
        result.current.addToCompare({ ...mockProperty, id: `test-${i}` })
      })
    }

    // Should not be able to add more
    expect(result.current.canAddMore).toBe(false)
  })

  it('should add property to compare', () => {
    const { result } = renderHook(() => useCompare())

    act(() => {
      result.current.addToCompare(mockProperty)
    })

    expect(result.current.compareList).toContainEqual(mockProperty)
  })

  it('should remove property from compare', () => {
    const { result } = renderHook(() => useCompare())

    act(() => {
      result.current.addToCompare(mockProperty)
    })

    act(() => {
      result.current.removeFromCompare(mockProperty.id)
    })

    expect(result.current.compareList).not.toContainEqual(mockProperty)
  })

  it('should clear compare list', () => {
    const { result } = renderHook(() => useCompare())

    act(() => {
      result.current.addToCompare(mockProperty)
      result.current.addToCompare({ ...mockProperty, id: 'test-2' })
    })

    act(() => {
      result.current.clearCompare()
    })

    expect(result.current.compareList).toHaveLength(0)
  })
})
