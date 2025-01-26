import { Dumbbell, Home, Car, Train } from 'lucide-react'

interface WelcomeMessageProps {
  onSuggestionClick: (suggestion: string) => void
}

const suggestions = [
  { text: '2BHK under 1Cr with gym', Icon: Dumbbell },
  { text: '3BHK in Whitefield', Icon: Home },
  { text: 'Spacious flat with parking', Icon: Car },
  { text: 'Near metro station', Icon: Train },
]

export function WelcomeMessage({ onSuggestionClick }: WelcomeMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25">
        <svg
          className="w-10 h-10 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Welcome to CribInfo
      </h2>
      <p className="text-gray-500 text-center mb-8 max-w-md leading-relaxed">
        Find your perfect home using natural language. Just describe what you're
        looking for and I'll find the best matches.
      </p>

      <div className="w-full max-w-lg">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 text-center">
          Try these searches
        </p>
        <div className="grid grid-cols-2 gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.text}
              onClick={() => onSuggestionClick(suggestion.text)}
              className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                <suggestion.Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="group-hover:text-blue-600 transition-colors">
                {suggestion.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-gray-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Powered by AI-driven property search</span>
      </div>
    </div>
  )
}
