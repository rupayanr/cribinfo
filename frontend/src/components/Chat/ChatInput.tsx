import { useState, KeyboardEvent } from 'react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState('')
  const [isFocused, setIsFocused] = useState(false)

  const handleSend = () => {
    if (input.trim() && !disabled) {
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

  return (
    <div className="bg-gradient-to-t from-gray-100 via-gray-50 to-transparent pt-6 pb-4 px-4">
      <div className="max-w-3xl mx-auto">
        <div
          className={`
            flex items-center gap-3 bg-white rounded-2xl p-2 pl-4
            shadow-lg border-2 transition-all duration-200
            ${isFocused ? 'border-blue-400 shadow-blue-100' : 'border-gray-200 shadow-gray-200/50'}
            ${disabled ? 'opacity-60' : ''}
          `}
        >
          <div className="text-gray-400">
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
            placeholder="Search for your dream home... e.g., 2BHK under 1Cr with gym"
            disabled={disabled}
            className="flex-1 py-3 text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm
              transition-all duration-200 transform
              ${
                disabled || !input.trim()
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:shadow-md active:scale-95'
              }
            `}
          >
            <svg
              className="w-4 h-4"
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
            Search
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-3">
          Try: "3BHK in Whitefield" or "Spacious flat with parking under 80L"
        </p>
      </div>
    </div>
  )
}
