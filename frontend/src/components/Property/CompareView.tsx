import { useCompare } from '../../hooks/useCompare'

export function CompareView() {
  const { compareList, removeFromCompare, clearCompare } = useCompare()

  if (compareList.length === 0) return null

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    if (price >= 100) {
      return `${(price / 100).toFixed(2)} Cr`
    }
    return `${price} L`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-3 sm:p-4 z-40">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-3 sm:mb-4">
          <h3 className="font-semibold text-base sm:text-lg">
            Compare ({compareList.length}/5)
          </h3>
          <button
            onClick={clearCompare}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear
          </button>
        </div>

        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
          <table className="w-full text-xs sm:text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-2 sm:pr-4 whitespace-nowrap">Property</th>
                {compareList.map((p) => (
                  <th key={p.id} className="text-left py-2 px-2 sm:px-4 min-w-[100px] sm:min-w-[150px]">
                    <div className="flex items-center justify-between gap-1">
                      <span className="truncate text-xs sm:text-sm">{p.area || 'Property'}</span>
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="text-gray-400 hover:text-red-600 text-base sm:text-lg"
                      >
                        &times;
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-2 sm:pr-4 font-medium whitespace-nowrap">BHK</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4">{p.bhk || 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-2 sm:pr-4 font-medium whitespace-nowrap">Price</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4 whitespace-nowrap">{formatPrice(p.price_lakhs)}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-2 sm:pr-4 font-medium whitespace-nowrap">Size</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-2 sm:px-4 whitespace-nowrap">{p.sqft ? `${p.sqft} sqft` : 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b hidden sm:table-row">
                <td className="py-2 pr-4 font-medium">Bathrooms</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-4">{p.bathrooms || 'N/A'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
