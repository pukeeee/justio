/**
 * Skeleton для Header во время загрузки
 */
export default function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo skeleton */}
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />

          {/* Nav skeleton */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
          </div>

          {/* Auth skeleton */}
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    </header>
  );
}
