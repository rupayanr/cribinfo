import { useState, useEffect } from 'react'
import { X, Server, Clock } from 'lucide-react'

const STORAGE_KEY = 'cribinfo-welcome-dismissed'

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) {
      setIsOpen(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Server className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Welcome to CribInfo!</h2>
        </div>

        <div className="space-y-3 text-gray-600">
          <div className="flex gap-3 items-start">
            <Clock className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
            <p>
              <span className="font-medium text-gray-800">Heads up:</span> The backend is hosted on Render's free tier,
              which sleeps after inactivity. Your first query may take <span className="font-medium">15-30 seconds</span> to wake up the server.
            </p>
          </div>
          <p className="text-sm text-gray-500">
            Subsequent searches will be fast. Thanks for your patience!
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
        >
          Got it, let's search!
        </button>
      </div>
    </div>
  )
}
