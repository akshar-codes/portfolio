import { useEffect, useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import IconButton from "@mui/material/IconButton";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { useMediaLibraryQuery } from "../../hooks/useMediaLibrary";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import DataTablePagination from "../table/DataTablePagination";

const PAGE_SIZE = 18;

/**
 * Modal image picker backed by the centralized Media Library
 * (GET /api/admin/media). Returns the selected asset's secure URL to
 * the caller via `onSelect` — it never uploads or mutates anything,
 * it's a pure read/select surface over media already in the library.
 */
export default function MediaPickerDialog({ open, onClose, onSelect, title = "Select an image" }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    if (open) {
      setSearch("");
      setPage(1);
      setSelectedId(null);
    }
  }, [open]);

  const { data, isLoading, isFetching } = useMediaLibraryQuery(
    { page, limit: PAGE_SIZE, search: debouncedSearch || undefined },
    { enabled: open },
  );

  const handleConfirm = useCallback(() => {
    const asset = data?.media?.find((m) => m._id === selectedId);
    if (asset) {
      onSelect(asset.url);
      onClose();
    }
  }, [data, selectedId, onSelect, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>{title}</DialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          fullWidth
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search media…"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        {isLoading ? (
          <Box className="flex items-center justify-center py-16">
            <CircularProgress size={28} />
          </Box>
        ) : (data?.media ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary" className="text-center py-16">
            No media found. Upload images from the Media Library first.
          </Typography>
        ) : (
          <ImageList cols={3} gap={12} sx={{ opacity: isFetching ? 0.6 : 1, m: 0 }}>
            {data.media.map((asset) => {
              const isSelected = asset._id === selectedId;
              return (
                <ImageListItem
                  key={asset._id}
                  onClick={() => setSelectedId(asset._id)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "transparent",
                  }}
                >
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.originalName}
                    loading="lazy"
                    style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
                  />
                  <ImageListItemBar
                    title={asset.originalName}
                    actionIcon={
                      isSelected ? (
                        <IconButton sx={{ color: "primary.light" }} aria-label="Selected">
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      ) : null
                    }
                  />
                </ImageListItem>
              );
            })}
          </ImageList>
        )}

        {data?.totalPages > 1 && (
          <DataTablePagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={!selectedId}>
          Use selected image
        </Button>
      </DialogActions>
    </Dialog>
  );
}
