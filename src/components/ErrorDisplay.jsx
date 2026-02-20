export default function ErrorDisplay({ error, onRetry, onDismiss }) {
  const getErrorIcon = () => {
    if (error.includes('network') || error.includes('offline')) return '📡';
    if (error.includes('rate limit')) return '⏱️';
    if (error.includes('not found') || error.includes('invalid')) return '🔍';
    if (error.includes('permission') || error.includes('denied')) return '🚫';
    return '⚠️';
  };

  const getErrorTitle = () => {
    if (error.includes('network') || error.includes('offline')) return 'Connection Issue';
    if (error.includes('rate limit')) return 'Too Many Requests';
    if (error.includes('not found') || error.includes('invalid')) return 'City Not Found';
    if (error.includes('permission') || error.includes('denied')) return 'Permission Denied';
    return 'Something Went Wrong';
  };

  return (
    <div className="w-full animate-fadeIn">
      <div className="bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">{getErrorIcon()}</div>
          <h3 className="text-2xl font-bold mb-3 text-white">{getErrorTitle()}</h3>
          <p className="text-white/80 mb-6 text-lg">{error}</p>
          
          <div className="flex gap-3 justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-white/20 hover:bg-white/30 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <span>🔄</span>
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
