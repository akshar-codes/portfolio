import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Collapse from "@mui/material/Collapse";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import RestoreOutlinedIcon from "@mui/icons-material/RestoreOutlined";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";

import PageHeader from "../../components/common/PageHeader";
import ToolbarBar from "../../components/common/Toolbar";
import FilterBar from "../../components/common/FilterBar";
import EmptyState from "../../components/common/EmptyState";
import RequirePermission from "../../components/auth/RequirePermission";

import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFilters } from "../../hooks/useFilters";
import {
  useInfiniteMediaLibraryQuery,
  useDeleteMedia,
  useRestoreMedia,
  useBulkDeleteMedia,
  useBulkRestoreMedia,
  useBulkPermanentlyDeleteMedia,
} from "../../hooks/useMediaLibrary";
import { downloadMediaBatch } from "../../utils/downloadFiles";
import { PERMISSIONS } from "../../constants/permissions";

import FolderSidebar from "../../components/media/FolderSidebar";
import MediaUploadDropzone from "../../components/media/MediaUploadDropzone";
import MediaGridItem from "../../components/media/MediaGridItem";
import MediaGridSkeleton from "../../components/media/MediaGridSkeleton";
import MediaDetailsDrawer from "../../components/media/MediaDetailsDrawer";

const SORT_OPTIONS = [
  { label: "Newest first", value: "createdAt:desc" },
  { label: "Oldest first", value: "createdAt:asc" },
  { label: "Name (A–Z)", value: "originalName:asc" },
  { label: "Name (Z–A)", value: "originalName:desc" },
  { label: "Largest file", value: "bytes:desc" },
  { label: "Smallest file", value: "bytes:asc" },
];

const FORMAT_OPTIONS = [
  { label: "All formats", value: "" },
  { label: "JPG", value: "jpg" },
  { label: "PNG", value: "png" },
  { label: "WEBP", value: "webp" },
  { label: "GIF", value: "gif" },
];

export default function ManageMedia() {
  const { filters, setFilter } = useFilters({ search: "", format: "", sort: "createdAt:desc" });
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const [activeFolder, setActiveFolder] = useState("");
  const [showTrash, setShowTrash] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailsItem, setDetailsItem] = useState(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const confirm = useConfirmDialog();
  const { showLoading, hideLoading } = useGlobalLoading();

  const [sortBy, sortOrder] = filters.sort.split(":");

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      folder: activeFolder || undefined,
      format: filters.format || undefined,
      status: showTrash ? "trash" : "active",
      sortBy,
      sortOrder,
      limit: 24,
    }),
    [debouncedSearch, activeFolder, filters.format, showTrash, sortBy, sortOrder],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteMediaLibraryQuery(queryParams);

  const { mutateAsync: deleteMedia } = useDeleteMedia();
  const { mutateAsync: restoreMedia } = useRestoreMedia();
  const { mutateAsync: bulkDelete } = useBulkDeleteMedia();
  const { mutateAsync: bulkRestore } = useBulkRestoreMedia();
  const { mutateAsync: bulkPermanentlyDelete } = useBulkPermanentlyDeleteMedia();

  const items = useMemo(() => data?.pages.flatMap((p) => p.media) ?? [], [data]);
  const total = data?.pages?.[0]?.total ?? 0;

  // Selection resets whenever the visible item set's context changes
  // (folder/trash/search/format switch) so stale IDs from a different
  // view can't linger into a bulk action.
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeFolder, showTrash, debouncedSearch, filters.format]);

  const sentinelRef = useRef(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleSelect = (item) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item._id)) next.delete(item._id);
      else next.add(item._id);
      return next;
    });
  };

  const selectedItems = items.filter((m) => selectedIds.has(m._id));

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: `Move "${item.originalName}" to trash?`,
      confirmLabel: "Move to trash",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await deleteMedia(item._id);
      toast.success("Moved to trash.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePermanentDelete = async (item) => {
    const confirmed = await confirm({
      title: `Permanently delete "${item.originalName}"?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete forever",
      tone: "danger",
    });
    if (!confirmed) return;
    try {
      await bulkPermanentlyDelete([item._id]);
      toast.success("Permanently deleted.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRestore = async (item) => {
    try {
      await restoreMedia(item._id);
      toast.success("Restored.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const confirmed = await confirm({
      title: `Move ${ids.length} file${ids.length === 1 ? "" : "s"} to trash?`,
      confirmLabel: "Move to trash",
      tone: "danger",
    });
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDelete(ids);
      toast.success(`${ids.length} file${ids.length === 1 ? "" : "s"} moved to trash.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkRestore = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setBulkBusy(true);
    try {
      await bulkRestore(ids);
      toast.success(`${ids.length} file${ids.length === 1 ? "" : "s"} restored.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkPermanentDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    const confirmed = await confirm({
      title: `Permanently delete ${ids.length} file${ids.length === 1 ? "" : "s"}?`,
      description: "This cannot be undone.",
      confirmLabel: "Delete forever",
      tone: "danger",
    });
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkPermanentlyDelete(ids);
      toast.success(`${ids.length} file${ids.length === 1 ? "" : "s"} permanently deleted.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedItems.length === 0) return;
    showLoading(`Downloading ${selectedItems.length} file${selectedItems.length === 1 ? "" : "s"}…`);
    const { succeeded, failed } = await downloadMediaBatch(selectedItems);
    hideLoading();
    if (failed === 0) toast.success(`${succeeded} file${succeeded === 1 ? "" : "s"} downloaded.`);
    else toast.warning(`${succeeded} downloaded, ${failed} failed.`);
  };

  const showEmpty = !isLoading && items.length === 0;

  return (
    <>
      <PageHeader
        title="Media Library"
        subtitle="Upload, organize, and manage every image used across the site."
        badge={typeof total === "number" ? <Chip size="small" variant="outlined" label={`${total} total`} /> : null}
        actions={
          <RequirePermission permission={PERMISSIONS.MEDIA_UPLOAD}>
            <Button
              variant={showUploader ? "contained" : "outlined"}
              startIcon={<CloudUploadOutlinedIcon />}
              onClick={() => setShowUploader((p) => !p)}
            >
              Upload
            </Button>
          </RequirePermission>
        }
      />

      <Collapse in={showUploader} unmountOnExit>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <MediaUploadDropzone folder={activeFolder} />
        </Paper>
      </Collapse>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
        <FolderSidebar
          activeFolder={activeFolder}
          onSelectFolder={(slug) => {
            setActiveFolder(slug);
            setShowTrash(false);
          }}
          showTrash={showTrash}
          onSelectTrash={() => {
            setShowTrash(true);
            setActiveFolder("");
          }}
        />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <ToolbarBar
            searchValue={filters.search}
            onSearchChange={(v) => setFilter("search", v)}
            searchPlaceholder="Search by name, alt text, caption, or tag…"
            filters={
              <FilterBar
                filters={[
                  { label: "Format", value: filters.format, onChange: (v) => setFilter("format", v), options: FORMAT_OPTIONS },
                  { label: "Sort", value: filters.sort, onChange: (v) => setFilter("sort", v), options: SORT_OPTIONS },
                ]}
              />
            }
            selectedCount={selectedIds.size}
            bulkActions={
              <Box className="flex items-center gap-1.5 flex-wrap">
                {showTrash ? (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RestoreOutlinedIcon fontSize="small" />}
                      onClick={handleBulkRestore}
                      disabled={bulkBusy}
                    >
                      Restore
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="contained"
                      startIcon={<DeleteForeverOutlinedIcon fontSize="small" />}
                      onClick={handleBulkPermanentDelete}
                      disabled={bulkBusy}
                    >
                      Delete forever
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DownloadOutlinedIcon fontSize="small" />}
                      onClick={handleBulkDownload}
                    >
                      Download
                    </Button>
                    <RequirePermission permission={PERMISSIONS.MEDIA_DELETE}>
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        onClick={handleBulkDelete}
                        disabled={bulkBusy}
                      >
                        Move to trash
                      </Button>
                    </RequirePermission>
                  </>
                )}
              </Box>
            }
          />

          {isLoading && <MediaGridSkeleton />}

          {isError && (
            <EmptyState
              icon={<PhotoLibraryOutlinedIcon fontSize="large" />}
              title="Something went wrong"
              description={error?.message}
              action={
                <Button variant="outlined" onClick={refetch}>
                  Try again
                </Button>
              }
            />
          )}

          {showEmpty && !isError && (
            <EmptyState
              icon={<PhotoLibraryOutlinedIcon fontSize="large" />}
              title={showTrash ? "Trash is empty" : "No media yet"}
              description={showTrash ? "Deleted files will appear here." : "Upload your first image to get started."}
            />
          )}

          {!isLoading && !isError && items.length > 0 && (
            <>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                  gap: 2,
                }}
              >
                {items.map((item) => (
                  <MediaGridItem
                    key={item._id}
                    item={item}
                    selected={selectedIds.has(item._id)}
                    onToggleSelect={toggleSelect}
                    onOpenDetails={showTrash ? undefined : setDetailsItem}
                    isTrash={showTrash}
                    onRestore={handleRestore}
                    onDelete={showTrash ? handlePermanentDelete : handleDelete}
                    onDownload={(m) => downloadMediaBatch([m])}
                  />
                ))}
              </Box>

              <Box ref={sentinelRef} sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                {isFetchingNextPage && <CircularProgress size={24} />}
              </Box>
            </>
          )}
        </Box>
      </Box>

      <MediaDetailsDrawer
        open={!!detailsItem}
        media={detailsItem}
        onClose={() => setDetailsItem(null)}
        onDeleted={() => setDetailsItem(null)}
      />
    </>
  );
}
