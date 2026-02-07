export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-8 py-10">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-12">
          <div>
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-6 w-96 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-12 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[140px] bg-gray-200 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Filters Bar Skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-11 w-28 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-36 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-11 w-28 bg-gray-200 rounded-lg animate-pulse" />
          <div className="ml-auto flex gap-2">
            <div className="h-11 w-11 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-11 w-11 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Card Table Skeleton */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
