// Shimmer skeleton loader components

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent`;

export const SkeletonCard = () => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded-xl p-6 ${shimmer}`}>
    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3" />
    <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-2" />
    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3" />
  </div>
);

export const SkeletonRow = () => (
  <div className={`flex items-center space-x-4 p-4 ${shimmer}`}>
    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
    </div>
    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
  </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
  <div className="divide-y divide-gray-200 dark:divide-gray-700">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

export const SkeletonStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
