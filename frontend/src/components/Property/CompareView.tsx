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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">
            Compare Properties ({compareList.length}/5)
          </h3>
          <button
            onClick={clearCompare}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Clear all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Property</th>
                {compareList.map((p) => (
                  <th key={p.id} className="text-left py-2 px-4 min-w-[150px]">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{p.area || 'Property'}</span>
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="ml-2 text-gray-400 hover:text-red-600"
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
                <td className="py-2 pr-4 font-medium">BHK</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-4">{p.bhk || 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Price</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-4">{formatPrice(p.price_lakhs)}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 font-medium">Size</td>
                {compareList.map((p) => (
                  <td key={p.id} className="py-2 px-4">{p.sqft ? `${p.sqft} sqft` : 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
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
