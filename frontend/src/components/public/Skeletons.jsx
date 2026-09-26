/**
 * Public-site loading-skeleton primitives. Kept separate from the
 * admin panel's LoadingSkeleton/AdminSkeleton — those are MUI-themed
 * and only load correctly under useAdminStyles(). These are plain
 * Tailwind + the public CSS custom properties (public.css), so they
 * render correctly on every public route without pulling in admin.css.
 *
 * Uses Tailwind's built-in `animate-pulse` utility — still available
 * even with corePlugins.preflight disabled (see tailwind.config.js),
 * since that only disables the base reset, not other utility classes.
 */

export function SkeletonBlock({ className = "", style }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className}`}
      style={{ backgroundColor: "var(--bg-card)", ...style }}
      aria-hidden="true"
    />
  );
}

export function SkeletonAvatar({ size = 96, className = "" }) {
  return (
    <SkeletonBlock
      className={`rounded-full ${className}`}
      style={{ width: size, height: size, flexShrink: 0 }}
    />
  );
}

export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBlock
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 && lines > 1 ? "65%" : "100%" }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "", lines = 2 }) {
  return (
    <div
      className={`rounded-xl p-6 flex flex-col gap-3 ${className}`}
      style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <SkeletonBlock className="h-4 w-1/3" />
      <SkeletonText lines={lines} />
    </div>
  );
}

export function SkeletonGrid({ count = 4, className = "", cardLines = 2 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-5 ${className}`} role="status" aria-label="Loading content">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={cardLines} />
      ))}
    </div>
  );
}

export function SkeletonPillRow({ count = 4, className = "" }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className="h-7 rounded-full" style={{ width: 70 + (i % 3) * 20 }} />
      ))}
    </div>
  );
}
