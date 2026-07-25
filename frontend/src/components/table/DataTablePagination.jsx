import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

/**
 * Standalone server-side pagination control. Deliberately separate
 * from DataTable so it can be reused anywhere a paginated list is
 * rendered without a table (a card grid, a gallery, ...).
 */
export default function DataTablePagination({ page, totalPages, totalCount, onPageChange }) {
  if (!totalPages || totalPages <= 1) {
    return typeof totalCount === "number" ? (
      <Box className="flex items-center justify-end px-4 py-2.5" sx={{ borderTop: "1px solid", borderColor: "divider" }}>
        <Typography variant="caption" color="text.secondary">
          {totalCount} total
        </Typography>
      </Box>
    ) : null;
  }

  return (
    <Box className="flex items-center justify-between gap-3 px-4 py-2.5" sx={{ borderTop: "1px solid", borderColor: "divider" }}>
      <Typography variant="caption" color="text.secondary">
        {typeof totalCount === "number" ? `${totalCount} total` : `Page ${page} of ${totalPages}`}
      </Typography>
      <Box className="flex items-center gap-1">
        <IconButton size="small" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <KeyboardArrowLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" sx={{ minWidth: 64, textAlign: "center" }}>
          {page} / {totalPages}
        </Typography>
        <IconButton size="small" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          <KeyboardArrowRightIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
