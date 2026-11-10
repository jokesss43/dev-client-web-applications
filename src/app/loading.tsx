export function CommentCardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-xs animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gray-200" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-3 bg-gray-100 rounded w-1/6" />
        </div>
      </div>
      <div className="space-y-2 py-2">
        <div className="h-3.5 bg-gray-200 rounded w-full" />
        <div className="h-3.5 bg-gray-100 rounded w-5/6" />
      </div>
      <div className="pt-3 border-t border-gray-100 flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-16" />
        <div className="h-3 bg-gray-200 rounded w-24" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="space-y-4 my-6">
      <div className="h-10 bg-gray-200 rounded-lg w-full animate-pulse mb-6" />
      <CommentCardSkeleton />
      <CommentCardSkeleton />
      <CommentCardSkeleton />
      <CommentCardSkeleton />
    </div>
  );
}
