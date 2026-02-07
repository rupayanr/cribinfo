import { useEffect } from 'react'
import { MapPin, Building2, Landmark, Castle } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'

interface CityOption {
  name: string
  label: string
  description: string
  Icon: typeof Building2
  color: string
  disabled?: boolean
}

const CITIES: CityOption[] = [
  {
    name: 'bangalore',
    label: 'Bangalore',
    description: 'Silicon Valley of India',
    Icon: Building2,
    color: 'from-purple-500 to-indigo-600'
  },
  {
    name: 'mumbai',
    label: 'Mumbai',
    description: 'City of Dreams',
    Icon: Landmark,
    color: 'from-orange-500 to-red-600'
  },
  {
    name: 'delhi',
    label: 'Delhi',
    description: 'Heart of India',
    Icon: Castle,
    color: 'from-emerald-500 to-teal-600'
  },
]

export function CitySelector() {
  const { city, setCity, citySelectorOpen, setCitySelectorOpen } = useSearchStore()

  const selectedCity = CITIES.find(c => c.name === city)

  // Auto-open modal if no city is selected on mount
  useEffect(() => {
    if (!city) {
      setCitySelectorOpen(true)
    }
  }, [])

  const handleSelectCity = (cityName: string, disabled?: boolean) => {
    if (disabled) return
    setCity(cityName)
    setCitySelectorOpen(false)
  }

  const handleClose = () => {
    // Only allow closing if a city is selected
    if (city) {
      setCitySelectorOpen(false)
    }
  }

  return (
    <>
      {/* City Chip / Button */}
      {selectedCity ? (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
          onClick={() => setCitySelectorOpen(true)}
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{selectedCity.label}</span>
        </div>
      ) : (
        <button
          onClick={() => setCitySelectorOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-full text-sm font-medium text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all animate-pulse"
        >
          <MapPin className="w-4 h-4" />
          Select City
        </button>
      )}

      {/* Modal Overlay */}
      {citySelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Select City</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {city ? 'Change your search location' : 'Choose a city to start searching'}
                  </p>
                </div>
                {city && (
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* City Options */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {CITIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => handleSelectCity(c.name, c.disabled)}
                  disabled={c.disabled}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    c.disabled
                      ? 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60'
                      : city === c.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {/* City Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg ${!c.disabled && 'group-hover:scale-105'} transition-transform ${c.disabled && 'grayscale'}`}>
                    <c.Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* City Info */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${c.disabled ? 'text-gray-400' : city === c.name ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'}`}>
                      {c.label}
                    </h3>
                    <p className={`text-sm ${c.disabled ? 'text-gray-400' : 'text-gray-500'}`}>{c.description}</p>
                  </div>

                  {/* Selected Indicator */}
                  {city === c.name && !c.disabled && (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            {!city && (
              <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/10 border-t border-amber-100 dark:border-amber-800">
                <p className="text-sm text-amber-700 dark:text-amber-300 text-center font-medium">
                  Please select a city to continue
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
