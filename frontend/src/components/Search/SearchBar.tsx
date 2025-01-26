import { useState, FormEvent } from 'react'
import { useSearchStore } from '../../stores/searchStore'
import { useSearch } from '../../hooks/useSearch'

export function SearchBar() {
  const { query, setQuery, isLoading } = useSearchStore()
  const { search } = useSearch()
  const [inputValue, setInputValue] = useState(query)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setQuery(inputValue)
    search(inputValue)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search properties... e.g., '2BHK under 1Cr with gym in Koramangala'"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>
    </form>
  )
}
