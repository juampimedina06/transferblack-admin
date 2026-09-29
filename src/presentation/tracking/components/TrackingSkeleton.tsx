export const TrackingSkeleton: React.FC = () => {
  return (
    <div className="max-w-lg mx-auto space-y-4 animate-pulse">
      <div className="h-40 bg-gray-200 rounded-xl" />
      <div className="h-64 bg-gray-200 rounded-xl" />
      <div className="h-20 bg-gray-200 rounded-xl" />
      <div className="h-24 bg-gray-200 rounded-xl" />
    </div>
  );
};
