import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

/**
 * Grid-shaped skeleton for the Media Library's initial load. Kept
 * separate from components/common/LoadingSkeleton.jsx, which is a
 * stacked-block skeleton for non-grid layouts — this one mirrors the
 * actual `repeat(auto-fill, minmax(160px, 1fr))` grid ManageMedia.jsx
 * renders once data arrives, so there's no layout shift on load.
 */
export default function MediaGridSkeleton({ count = 12 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: 2,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant="rounded" sx={{ aspectRatio: "1 / 1", width: "100%" }} />
          <Skeleton variant="text" width="80%" sx={{ mt: 1 }} />
          <Skeleton variant="text" width="50%" />
        </Box>
      ))}
    </Box>
  );
}
