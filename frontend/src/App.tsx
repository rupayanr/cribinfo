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
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-gray-900">CribInfo</h1>
            <CitySelector />
          </div>
          <div className="flex items-center gap-2">
            {results.length > 0 && (
              <>
                <button
                  onClick={() => setViewMode('chat')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    viewMode === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Chat
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    viewMode === 'map'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Map
                </button>
              </>
            )}
            <button
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
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
