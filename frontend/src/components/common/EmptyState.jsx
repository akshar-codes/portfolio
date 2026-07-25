import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Generic empty-state block. Used internally by DataTable, but kept
 * standalone so it's equally usable outside tables (an empty card
 * grid, an empty dashboard section, etc).
 */
export default function EmptyState({ icon, title = "Nothing here yet", description, action }) {
  return (
    <Box className="flex flex-col items-center text-center gap-2 py-12 px-4">
      {icon && <Box sx={{ color: "text.disabled" }}>{icon}</Box>}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" className="max-w-sm">
          {description}
        </Typography>
      )}
      {action && <Box className="mt-2">{action}</Box>}
    </Box>
  );
}
