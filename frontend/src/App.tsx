import { useState, useEffect } from 'react'
import { CitySelector } from './components/Search/CitySelector'
import { PropertyMap } from './components/Map/PropertyMap'
import { CompareView } from './components/Property/CompareView'
import { ChatContainer } from './components/Chat'
import { useSearchStore } from './stores/searchStore'

type ViewMode = 'chat' | 'map'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('chat')
  const { results, compareList, clearChat, clearCompare, setCity } = useSearchStore()

  // Reset to chat view when results are cleared
  useEffect(() => {
    if (results.length === 0 && viewMode === 'map') {
      setViewMode('chat')
    }
  }, [results.length, viewMode])

  const handleClear = () => {
    clearChat()
    clearCompare()
    setCity('') // Reset to all cities
    setViewMode('chat') // Always go back to chat after clearing
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 shrink-0">CribInfo</h1>
            <CitySelector />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {results.length > 0 && (
              <>
                <button
                  onClick={() => setViewMode('chat')}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm ${
                    viewMode === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Chat view"
                >
                  <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span className="hidden sm:inline">Chat</span>
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title="Map view"
                >
                  <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span className="hidden sm:inline">Map</span>
                </button>
              </>
            )}
            <button
              onClick={handleClear}
              className="p-2 sm:px-3 sm:py-1.5 text-sm text-gray-500 hover:text-gray-700"
              title="Clear"
            >
              <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </header>

      <main className={`flex-1 overflow-hidden ${compareList.length > 0 ? 'pb-48' : ''}`}>
        {viewMode === 'chat' ? (
          <div className="h-full max-w-4xl mx-auto">
            <ChatContainer />
          </div>
        ) : (
          <div className="h-full">
            <PropertyMap />
          </div>
        )}
      </main>

      <CompareView />
    </div>
  )
}

export default App
