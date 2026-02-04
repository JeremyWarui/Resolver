/**
 * Full-screen loading spinner component
 * Displays a centered spinner with optional loading text
 * Covers the entire viewport while loading
 */
const FullScreenLoading = ({ message = "Loading dashboard..." }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  </div>
);

export default FullScreenLoading;
