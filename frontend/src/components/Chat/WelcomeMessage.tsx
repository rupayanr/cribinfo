import { Dumbbell, Home, Car, Train, MapPin, Waves, Building2, TreePine } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'

interface WelcomeMessageProps {
  onSuggestionClick: (suggestion: string) => void
  citySelected?: boolean
  selectedCity?: string
}

type SuggestionItem = {
  text: string
  Icon: typeof Dumbbell
}

const citySuggestions: Record<string, SuggestionItem[]> = {
  bangalore: [
    { text: '2BHK under 80L with gym', Icon: Dumbbell },
    { text: '3BHK in Whitefield', Icon: Home },
    { text: 'Flat with parking in Koramangala', Icon: Car },
    { text: 'Near metro in Indiranagar', Icon: Train },
  ],
  mumbai: [
    { text: '3BHK with sea view in Bandra', Icon: Waves },
    { text: '2BHK in Powai with lake view', Icon: Home },
    { text: 'Apartment in Andheri with gym', Icon: Dumbbell },
    { text: 'Budget flat in Thane', Icon: Building2 },
  ],
  delhi: [
    { text: '3BHK in Greater Kailash', Icon: Home },
    { text: '2BHK near metro in Dwarka', Icon: Train },
    { text: 'Flat with garden in Saket', Icon: TreePine },
    { text: 'Apartment in Gurgaon with pool', Icon: Waves },
  ],
}

const defaultSuggestions: SuggestionItem[] = [
  { text: '2BHK with gym', Icon: Dumbbell },
  { text: '3BHK spacious flat', Icon: Home },
  { text: 'Flat with parking', Icon: Car },
  { text: 'Near metro station', Icon: Train },
]

export function WelcomeMessage({ onSuggestionClick, citySelected = true, selectedCity }: WelcomeMessageProps) {
  const { setCitySelectorOpen } = useSearchStore()
  const suggestions = selectedCity && citySuggestions[selectedCity]
    ? citySuggestions[selectedCity]
    : defaultSuggestions

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 sm:py-12">
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-blue-500/25">
        <svg
          className="w-8 h-8 sm:w-10 sm:h-10 text-white"
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

      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Welcome to CribInfo
      </h2>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6 sm:mb-8 max-w-md leading-relaxed text-sm sm:text-base px-2">
        Find your perfect home using natural language. Just describe what you're
        looking for and I'll find the best matches.
      </p>

      {/* City Selection Status */}
      {citySelected && selectedCity && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-gray-500 dark:text-gray-400">Searching in</span>
          <button
            onClick={() => setCitySelectorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
            </span>
          </button>
        </div>
      )}

      <div className={`w-full max-w-lg ${!citySelected ? 'opacity-50 pointer-events-none' : ''}`}>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 text-center">
          Try these searches
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.text}
              onClick={() => citySelected && onSuggestionClick(suggestion.text)}
              disabled={!citySelected}
              className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:border-gray-200 disabled:hover:bg-white dark:disabled:hover:bg-gray-800 dark:disabled:hover:border-gray-600"
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors shrink-0 group-disabled:group-hover:bg-gray-100 dark:group-disabled:group-hover:bg-gray-700">
                <suggestion.Icon className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-colors group-disabled:group-hover:text-gray-500" />
              </div>
              <span className="group-hover:text-blue-600 transition-colors text-xs sm:text-sm group-disabled:group-hover:text-gray-700">
                {suggestion.text}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Powered by AI-driven property search</span>
      </div>
    </div>
  )
}
