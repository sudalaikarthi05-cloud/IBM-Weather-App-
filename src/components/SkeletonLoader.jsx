export default function SkeletonLoader() {
  return (
    <div className="w-full animate-pulse">
      <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl mb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex-1">
            <div className="h-8 bg-white/20 rounded w-3/4 mb-3"></div>
            <div className="h-5 bg-white/10 rounded w-1/2"></div>
          </div>
          <div className="h-16 w-16 bg-white/20 rounded-full"></div>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          <div className="h-20 bg-white/20 rounded w-32"></div>
          <div className="h-12 bg-white/10 rounded w-32"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-6 bg-white/10 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
