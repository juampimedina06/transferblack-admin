export const DriverDetailSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center bg-obsidian/50 p-6 rounded-lg border border-white/5">
        <div className="space-y-3">
          <div className="h-8 w-48 bg-white/10 rounded"></div>
          <div className="h-4 w-32 bg-white/10 rounded"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-white/10 rounded"></div>
          <div className="h-10 w-24 bg-white/10 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info Skeleton */}
        <div className="bg-obsidian/50 p-6 rounded-lg border border-white/5 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-4 w-32 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Info Skeleton */}
        <div className="bg-obsidian/50 p-6 rounded-lg border border-white/5 space-y-4">
          <div className="h-6 w-40 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-4 w-32 bg-white/10 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid Skeleton */}
      <div className="bg-obsidian/50 p-6 rounded-lg border border-white/5 space-y-4">
        <div className="h-6 w-40 bg-white/10 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center p-4">
              <div className="h-10 w-10 bg-white/10 rounded-full mb-3"></div>
              <div className="h-4 w-24 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
