import { useState, lazy, Suspense } from 'react'
import type { Property } from '../../types'
import { useCompare } from '../../hooks/useCompare'

const ChatMapContent = lazy(() => import('./ChatMapContent'))

interface ChatMapWidgetProps {
  properties: Property[]
}

export function ChatMapWidget({ properties }: ChatMapWidgetProps) {
  const [expanded, setExpanded] = useState(false)
  const { isInCompareList, toggleCompare } = useCompare()

  const mappable = properties.filter(
    (p) => p.latitude !== null && p.longitude !== null
  )

  if (mappable.length === 0) return null

  const fallback = (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400" style={{ height: 250 }}>
      Loading map...
    </div>
  )

  return (
    <>
      {/* Inline map */}
      <div className="mt-3 sm:mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
        <Suspense fallback={fallback}>
          <ChatMapContent properties={mappable} height="250px" />
        </Suspense>

        {/* Badge + expand button overlay */}
        <div className="absolute top-2 left-2 z-[400] flex items-center gap-2 pointer-events-none">
          <span className="pointer-events-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600">
            {mappable.length} on map
          </span>
        </div>
        <button
          onClick={() => setExpanded(true)}
          className="absolute top-2 right-2 z-[400] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-xs font-medium text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full shadow-sm border border-gray-200 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-700 transition-colors"
        >
          Expand Map
        </button>
      </div>

      {/* Expanded modal */}
      {expanded && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {mappable.length} properties on map
              </span>
              <button
                onClick={() => setExpanded(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <Suspense fallback={<div className="flex items-center justify-center h-full text-sm text-gray-500">Loading map...</div>}>
                <ChatMapContent
                  properties={mappable}
                  height="100%"
                  showCompare
                  onCompare={toggleCompare}
                  isCompared={isInCompareList}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
