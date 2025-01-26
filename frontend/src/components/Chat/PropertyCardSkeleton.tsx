export function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 animate-pulse">
      <div className="flex justify-between items-start mb-2">
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-6 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
      <div className="flex gap-3 mb-3">
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-3 bg-gray-200 rounded w-14" />
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
      <div className="h-5 bg-gray-200 rounded w-20" />
    </div>
  )
}
