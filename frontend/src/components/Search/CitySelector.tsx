import { useState } from 'react'
import { MapPin, X, Building2, Landmark, Castle, Globe } from 'lucide-react'
import { useSearchStore } from '../../stores/searchStore'

const CITIES = [
  {
    name: '',
    label: 'All Cities',
    description: 'Search across all locations',
    Icon: Globe,
    color: 'from-gray-500 to-gray-600'
  },
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
  const { city, setCity } = useSearchStore()
  const [isOpen, setIsOpen] = useState(false)

  const selectedCity = CITIES.find(c => c.name === city)

  const handleSelectCity = (cityName: string) => {
    setCity(cityName)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCity('')
  }

  return (
    <>
      {/* City Chip / Button */}
      {selectedCity && selectedCity.name ? (
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">{selectedCity.label}</span>
          <button
            onClick={handleClear}
            className="ml-1 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
            title="Clear city filter"
          >
            <X className="w-3.5 h-3.5 text-blue-500 hover:text-blue-700" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all"
        >
          <MapPin className="w-4 h-4" />
          Select City
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Select City</h2>
                  <p className="text-sm text-gray-500">Choose where you want to search</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* City Options */}
            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {CITIES.map((c) => (
                <button
                  key={c.name || 'all'}
                  onClick={() => handleSelectCity(c.name)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                    city === c.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {/* City Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <c.Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* City Info */}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${city === c.name ? 'text-blue-700' : 'text-gray-900'}`}>
                      {c.label}
                    </h3>
                    <p className="text-sm text-gray-500">{c.description}</p>
                  </div>

                  {/* Selected Indicator */}
                  {city === c.name && (
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                More cities coming soon
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
