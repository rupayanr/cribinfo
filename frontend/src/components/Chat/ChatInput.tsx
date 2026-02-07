import { useState, KeyboardEvent } from 'react'
import { MapPin } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  citySelected?: boolean
  onSelectCity?: () => void
}

export function ChatInput({ onSend, disabled = false, citySelected = true, onSelectCity }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const isDisabled = disabled || !citySelected

  const handleSend = () => {
    if (input.trim() && !isDisabled) {
      onSend(input.trim())
      setInput('')
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Show city selection prompt if no city is selected
  if (!citySelected) {
    return (
      <div className="bg-gradient-to-t from-gray-100 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent pt-4 sm:pt-6 pb-3 sm:pb-4 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={onSelectCity}
            className="w-full flex items-center justify-center gap-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-700 rounded-2xl p-4 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-300 dark:hover:border-amber-600 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center group-hover:bg-amber-200 dark:group-hover:bg-amber-800/50 transition-colors">
              <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-amber-800 dark:text-amber-300">Select a city to start</p>
              <p className="text-sm text-amber-600 dark:text-amber-400">Choose your preferred location first</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-t from-gray-100 via-gray-50 to-transparent dark:from-gray-900 dark:via-gray-900/80 dark:to-transparent pt-4 sm:pt-6 pb-3 sm:pb-4 px-3 sm:px-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={`
            flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-800 rounded-2xl p-1.5 sm:p-2 pl-3 sm:pl-4
            shadow-lg border-2 transition-all duration-200
            ${isFocused ? 'border-blue-400 shadow-blue-100 dark:shadow-blue-900/30' : 'border-gray-200 dark:border-gray-700 shadow-gray-200/50 dark:shadow-gray-900/50'}
            ${isDisabled ? 'opacity-60' : ''}
          `}
        >
          <div className="text-gray-400 dark:text-gray-500 hidden sm:block">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="2BHK under 1Cr with gym..."
            disabled={isDisabled}
            className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-transparent focus:outline-none disabled:cursor-not-allowed min-w-0"
          />
          <button
            onClick={handleSend}
            disabled={isDisabled || !input.trim()}
            className={`
              flex items-center justify-center gap-2 p-2.5 sm:px-5 sm:py-3 rounded-xl font-medium text-sm
              transition-all duration-200 transform shrink-0
              ${
                isDisabled || !input.trim()
                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-md active:scale-95'
              }
            `}
          >
            <svg
              className="w-5 h-5 sm:w-4 sm:h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2 sm:mt-3 hidden sm:block">
          Try: "3BHK in Whitefield" or "Spacious flat with parking under 80L"
        </p>
      </div>
    </div>
  )
}
