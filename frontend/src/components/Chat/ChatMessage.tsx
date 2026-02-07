import type { ChatMessage as ChatMessageType } from '../../types'
import { MessagePropertyCard } from './MessagePropertyCard'
import { PropertyCardSkeleton } from './PropertyCardSkeleton'
import { FilterBadges } from './FilterBadges'
import { ChatMapWidget } from '../Map/ChatMapWidget'

interface ChatMessageProps {
  message: ChatMessageType
  isLoading?: boolean
}

export function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div className="flex justify-end px-3 sm:px-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl rounded-tr-sm px-4 sm:px-5 py-2.5 sm:py-3 max-w-[85%] sm:max-w-[80%] shadow-md">
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4">
      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
        <svg
          className="w-4 h-4 sm:w-5 sm:h-5 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>
      <div className="flex-1 max-w-[90%] sm:max-w-[85%]">
        <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 sm:px-5 py-3 sm:py-4 shadow-sm border border-gray-100 dark:border-gray-700">
          {message.contentType === 'error' ? (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">{message.text}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{message.text}</p>
              {message.filters && <FilterBadges filters={message.filters} />}
            </>
          )}
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
            {[1, 2, 3, 4].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!isLoading &&
          message.properties &&
          message.properties.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-3 sm:mt-4">
                {message.properties.map((property) => (
                  <MessagePropertyCard key={property.id} property={property} />
                ))}
              </div>
              <ChatMapWidget properties={message.properties} />
            </>
          )}
      </div>
    </div>
  )
}
