import { useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'
import { useSearch } from '../../hooks/useSearch'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { WelcomeMessage } from './WelcomeMessage'
import { TypingIndicator } from './TypingIndicator'

export function ChatContainer() {
  const { messages, isTyping, city, clearChat, clearCompare } = useSearchStore()
  const { searchWithChat } = useSearch()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = (message: string) => {
    searchWithChat(message)
  }

  const handleClearChat = () => {
    clearChat()
    clearCompare()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto relative">
        {messages.length === 0 ? (
          <WelcomeMessage
            onSuggestionClick={handleSend}
            citySelected={!!city}
            selectedCity={city}
          />
        ) : (
          <>
            {/* Clear Chat Button - Centered */}
            <div className="sticky top-2 flex justify-center px-4 z-10">
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-full shadow-sm hover:border-red-300 dark:hover:border-red-700 transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear chat</span>
              </button>
            </div>
            <div className="py-4 space-y-4 -mt-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </div>
      <ChatInput
        onSend={handleSend}
        disabled={isTyping}
        citySelected={!!city}
      />
    </div>
  )
}
