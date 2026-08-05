import { useEffect, useState, useCallback, useMemo } from "react";
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
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import { useMediaLibraryQuery } from "../../hooks/useMediaLibrary";
import { useMediaFoldersQuery } from "../../hooks/useMediaFolders";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { getThumbnailUrl } from "../../utils/cloudinaryTransform";
import DataTablePagination from "../table/DataTablePagination";

const PAGE_SIZE = 18;
const RECENT_TAB = "__recent__";
const ALL_TAB = "__all__";

/**
 * Modal image picker backed by the centralized Media Library
 * (GET /api/admin/media). Never uploads or mutates anything — a pure
 * read/select surface over media already in the library, reused by
 * every CMS module's image fields (see components/LibraryImageField.jsx,
 * pages/admin/ManageSeo.jsx's inline picker, ...).
 *
 * - `multiple=false` (default): calls `onSelect(url: string)` — the
 *   original contract, unchanged, so every existing consumer keeps
 *   working without modification (this is also how "replace an
 *   existing image" already works: the caller re-opens this dialog
 *   from its current "Replace <field>" button and `onSelect`
 *   overwrites the field's stored URL).
 * - `multiple=true`: calls `onSelect(urls: string[])` instead.
 */
export default function MediaPickerDialog({
  open,
  onClose,
  onSelect,
  title = "Select an image",
  multiple = false,
}) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [folderTab, setFolderTab] = useState(RECENT_TAB);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const debouncedSearch = useDebouncedValue(search, 350);

  useEffect(() => {
    if (open) {
      setSearch("");
      setPage(1);
      setFolderTab(RECENT_TAB);
      setSelectedIds(new Set());
    }
  }, [open]);

  const { data: folders = [] } = useMediaFoldersQuery({ enabled: open });

  const isRecent = folderTab === RECENT_TAB;
  const queryParams = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      // "Recent" ignores search/folder entirely — it's a quick-access
      // shortcut to the newest uploads, distinct from "All files"
      // (which is the full searchable/filterable browse view).
      search: isRecent ? undefined : debouncedSearch || undefined,
      folder: isRecent || folderTab === ALL_TAB ? undefined : folderTab,
      sortBy: "createdAt",
      sortOrder: "desc",
    }),
    [page, debouncedSearch, folderTab, isRecent],
  );

  const { data, isLoading, isFetching } = useMediaLibraryQuery(queryParams, { enabled: open });

  const handleToggle = useCallback(
    (asset) => {
      if (!multiple) {
        setSelectedIds(new Set([asset._id]));
        return;
      }
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(asset._id)) next.delete(asset._id);
        else next.add(asset._id);
        return next;
      });
    },
    [multiple],
  );

  const handleConfirm = useCallback(() => {
    const chosen = (data?.media ?? []).filter((m) => selectedIds.has(m._id));
    if (chosen.length === 0) return;

    if (multiple) {
      onSelect(chosen.map((m) => m.url));
    } else {
      onSelect(chosen[0].url);
    }
    onClose();
  }, [data, selectedIds, multiple, onSelect, onClose]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>{title}</DialogTitle>
      <DialogContent dividers>
        <TextField
          size="small"
          fullWidth
          value={search}
          disabled={isRecent}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder={isRecent ? "Switch to “All files” to search…" : "Search media…"}
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

        <Tabs
          value={folderTab}
          onChange={(_e, value) => {
            setFolderTab(value);
            setPage(1);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 2, minHeight: 36, "& .MuiTab-root": { minHeight: 36, textTransform: "none" } }}
        >
          <Tab label="Recent" value={RECENT_TAB} />
          <Tab label="All files" value={ALL_TAB} />
          {folders.map((f) => (
            <Tab key={f._id} label={f.name} value={f.slug} />
          ))}
        </Tabs>

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
              const isSelected = selectedIds.has(asset._id);
              return (
                <ImageListItem
                  key={asset._id}
                  onClick={() => handleToggle(asset)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "2px solid",
                    borderColor: isSelected ? "primary.main" : "transparent",
                  }}
                >
                  <img
                    src={getThumbnailUrl(asset.url, 240)}
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
      <DialogActions sx={{ px: 3, pb: 2.5, display: "flex", alignItems: "center" }}>
        {multiple && selectedIds.size > 0 && (
          <Chip label={`${selectedIds.size} selected`} size="small" sx={{ mr: "auto" }} />
        )}
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" disabled={selectedIds.size === 0}>
          {multiple ? "Use selected images" : "Use selected image"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
