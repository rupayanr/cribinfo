export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 px-4" data-testid="typing-indicator">
      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.3s]" data-testid="typing-dot" />
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:-0.15s]" data-testid="typing-dot" />
          <span className="w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-bounce" data-testid="typing-dot" />
        </div>
      </div>
    </div>
  )
}
