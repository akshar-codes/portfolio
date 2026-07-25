import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Generic table toolbar. Owns no filtering state itself — `searchValue`/
 * `onSearchChange` and the `filters` slot are fully controlled by the
 * page (typically via useFilters). When `selectedCount` is non-zero and
 * `bulkActions` is provided, the toolbar swaps to a bulk-action bar.
 */
export default function Toolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
  filters,
  actions,
  bulkActions,
  selectedCount = 0,
}) {
  if (selectedCount > 0 && bulkActions) {
    return (
      <Box
        className="flex items-center justify-between gap-3 px-4 py-2.5 mb-3 rounded-2xl"
        sx={{ bgcolor: "action.selected" }}
      >
        <Typography variant="body2" fontWeight={600}>
          {selectedCount} selected
        </Typography>
        <Box className="flex items-center gap-2">{bulkActions}</Box>
      </Box>
    );
  }

  return (
    <Box className="flex flex-wrap items-center gap-2 mb-3">
      {onSearchChange && (
        <TextField
          size="small"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240 }}
        />
      )}
      {filters}
      <Box className="flex-1" />
      {actions}
    </Box>
  );
}
