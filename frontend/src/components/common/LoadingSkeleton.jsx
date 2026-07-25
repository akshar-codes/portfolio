import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

/**
 * Generic stacked-block skeleton for non-tabular loading states (card
 * grids, detail panels, form previews). DataTable renders its own
 * per-cell skeleton rows internally, since a table skeleton needs to
 * follow the table's actual column structure — this component is for
 * everything else.
 */
export default function LoadingSkeleton({ rows = 5, height = 22, gap = 12 }) {
  return (
    <Box className="flex flex-col" sx={{ gap: `${gap}px` }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rounded" height={height} />
      ))}
    </Box>
  );
}
