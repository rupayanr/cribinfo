import { useSearchStore } from '../stores/searchStore'
import type { Property } from '../types'

export function useCompare() {
  const { compareList, addToCompare, removeFromCompare, clearCompare } = useSearchStore()

  const isInCompareList = (propertyId: string) => {
    return compareList.some((p) => p.id === propertyId)
  }

  const toggleCompare = (property: Property) => {
    if (isInCompareList(property.id)) {
      removeFromCompare(property.id)
    } else {
      addToCompare(property)
    }
  }

  return {
    compareList,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompareList,
    toggleCompare,
    canAddMore: compareList.length < 5,
  }
}
