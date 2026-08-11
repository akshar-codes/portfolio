import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import MarkEmailUnreadOutlinedIcon from "@mui/icons-material/MarkEmailUnreadOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReportOutlinedIcon from "@mui/icons-material/ReportOutlined";

import PageHeader from "../../components/common/PageHeader";
import ToolbarBar from "../../components/common/Toolbar";
import FilterBar from "../../components/common/FilterBar";
import DataTable from "../../components/table/DataTable";
import RequirePermission from "../../components/auth/RequirePermission";
import MessageDetailsDrawer from "../../components/messages/MessageDetailsDrawer";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFilters } from "../../hooks/useFilters";
import { usePagination } from "../../hooks/usePagination";
import {
  useAdminMessagesQuery,
  useAdminMessageQuery,
  useUpdateMessageStatus,
  useArchiveMessage,
  useRestoreMessage,
  useToggleMessageSpam,
  useDeleteMessage,
  useBulkUpdateMessageStatus,
  useBulkArchiveMessages,
  useBulkRestoreMessages,
  useBulkDeleteMessages,
} from "../../hooks/useMessages";
import { getInitials, truncate } from "../../utils/strings";
import { relativeTime } from "../../utils/date";
import { PERMISSIONS } from "../../constants/permissions";

const MESSAGES_ADMIN_PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

// A single "folder" selector drives two independent backend flags
// (archived/spam) — mirrors the Inbox/Spam/All-Mail mental model most
// admins already have from email clients, without exposing the two
// underlying booleans as separate, easy-to-misconfigure dropdowns.
const FOLDER_OPTIONS = [
  { label: "Inbox", value: "inbox" },
  { label: "Archived", value: "archived" },
  { label: "Spam", value: "spam" },
  { label: "All mail", value: "all" },
];

function folderToParams(folder) {
  switch (folder) {
    case "archived":
      return { archived: "true", spam: "all" };
    case "spam":
      return { archived: "all", spam: "true" };
    case "all":
      return { archived: "all", spam: "all" };
    default:
      return { archived: "false", spam: "false" };
  }
}

export default function ManageMessages() {
  const [searchParams, setSearchParams] = useSearchParams();
  const deepLinkId = searchParams.get("open") || "";

  const { filters, setFilter } = useFilters({
    search: "",
    status: "",
    folder: "inbox",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });
  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const { page, limit, setPage } = usePagination({ initialLimit: MESSAGES_ADMIN_PAGE_SIZE });

  const folderParams = folderToParams(filters.folder);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      archived: folderParams.archived,
      spam: folderParams.spam,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      page,
      limit,
      debouncedSearch,
      filters.status,
      filters.dateFrom,
      filters.dateTo,
      filters.sortBy,
      filters.sortOrder,
      folderParams.archived,
      folderParams.spam,
    ],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useAdminMessagesQuery(queryParams);

  const { mutateAsync: updateStatus } = useUpdateMessageStatus();
  const { mutateAsync: archiveMessageMutation } = useArchiveMessage();
  const { mutateAsync: restoreMessageMutation } = useRestoreMessage();
  const { mutateAsync: toggleSpamMutation } = useToggleMessageSpam();
  const { mutateAsync: deleteMessageMutation } = useDeleteMessage();
  const { mutateAsync: bulkUpdateStatus, isPending: bulkStatusPending } = useBulkUpdateMessageStatus();
  const { mutateAsync: bulkArchive, isPending: bulkArchivePending } = useBulkArchiveMessages();
  const { mutateAsync: bulkRestore, isPending: bulkRestorePending } = useBulkRestoreMessages();
  const { mutateAsync: bulkDelete, isPending: bulkDeletePending } = useBulkDeleteMessages();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [detailsMessage, setDetailsMessage] = useState(null);

  const confirm = useConfirmDialog();
  const { showLoading, hideLoading } = useGlobalLoading();

  const messages = data?.messages ?? [];
  const bulkBusy = bulkStatusPending || bulkArchivePending || bulkRestorePending || bulkDeletePending;
  const showRestore = filters.folder === "archived" || filters.folder === "spam";

  /* ── Deep-link support: ?open=<id> opens the details drawer even if
   * the message isn't on the currently loaded page/filter (e.g. from
   * the Dashboard's "recent messages" widget). ────────────────────── */
  const { data: deepLinkMessage, isLoading: deepLinkLoading } = useAdminMessageQuery(deepLinkId, {
    enabled: Boolean(deepLinkId),
  });

  useEffect(() => {
    if (deepLinkId && deepLinkMessage && !deepLinkLoading) {
      setDetailsMessage(deepLinkMessage);
    }
  }, [deepLinkId, deepLinkMessage, deepLinkLoading]);

  const clearDeepLink = () => {
    if (!deepLinkId) return;
    const next = new URLSearchParams(searchParams);
    next.delete("open");
    setSearchParams(next, { replace: true });
  };

  const handleSort = (field) => {
    const nextOrder = filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";
    setFilter("sortBy", field);
    setFilter("sortOrder", nextOrder);
    setPage(1);
  };

  const handleOpenDetails = (row) => setDetailsMessage(row);

  const handleCloseDetails = () => {
    setDetailsMessage(null);
    clearDeepLink();
  };

  const handleToggleRead = async (row) => {
    const nextStatus = row.status === "unread" ? "read" : "unread";
    try {
      const updated = await updateStatus({ id: row._id, status: nextStatus });
      setDetailsMessage((prev) => (prev && prev._id === row._id ? updated : prev));
      toast.success(nextStatus === "read" ? "Marked as read." : "Marked as unread.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleArchive = async (row) => {
    try {
      const updated = row.isArchived ? await restoreMessageMutation(row._id) : await archiveMessageMutation(row._id);
      setDetailsMessage((prev) => (prev && prev._id === row._id ? updated : prev));
      toast.success(row.isArchived ? "Message restored to inbox." : "Message archived.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleSpam = async (row) => {
    try {
      const updated = await toggleSpamMutation({ id: row._id, isSpam: !row.isSpam });
      setDetailsMessage((prev) => (prev && prev._id === row._id ? updated : prev));
      toast.success(row.isSpam ? "Marked as not spam." : "Marked as spam.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /** Returns true iff the message was actually deleted (false if the
   * user cancelled the confirmation, or if the request failed) — the
   * drawer relies on this to decide whether to close itself. */
  const handleDelete = async (row) => {
    const confirmed = await confirm({
      title: `Delete message from "${row.fullname}"?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return false;

    try {
      await deleteMessageMutation(row._id);
      toast.success(`Message from "${row.fullname}" deleted.`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(row._id);
        return next;
      });
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    }
  };

  const handleBulkMarkRead = async () => {
    try {
      await bulkUpdateStatus({ ids: [...selectedIds], status: "read" });
      toast.success(`${selectedIds.size} message(s) marked as read.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkMarkUnread = async () => {
    try {
      await bulkUpdateStatus({ ids: [...selectedIds], status: "unread" });
      toast.success(`${selectedIds.size} message(s) marked as unread.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkArchive = async () => {
    try {
      await bulkArchive([...selectedIds]);
      toast.success(`${selectedIds.size} message(s) archived.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkRestore = async () => {
    try {
      await bulkRestore([...selectedIds]);
      toast.success(`${selectedIds.size} message(s) restored.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const confirmed = await confirm({
      title: `Delete ${ids.length} message${ids.length === 1 ? "" : "s"}?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete all",
      tone: "danger",
    });
    if (!confirmed) return;

    showLoading(`Deleting ${ids.length} message${ids.length === 1 ? "" : "s"}…`);
    try {
      await bulkDelete(ids);
      toast.success(`${ids.length} message${ids.length === 1 ? "" : "s"} deleted.`);
      setSelectedIds(new Set());
    } catch (err) {
      toast.error(err.message);
    } finally {
      hideLoading();
    }
  };

  const columns = [
    {
      field: "fullname",
      headerName: "Sender",
      sortable: true,
      render: (row) => (
        <Box className="flex items-center gap-2.5 min-w-0">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 13,
              bgcolor: row.status === "unread" ? "primary.main" : "action.disabledBackground",
            }}
          >
            {getInitials(row.fullname)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={row.status === "unread" ? 700 : 500} fontSize={14} noWrap>
              {row.fullname}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
              {row.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: "message",
      headerName: "Message",
      render: (row) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340 }} noWrap>
          {truncate(row.message, 100)}
        </Typography>
      ),
    },
    {
      field: "flags",
      headerName: "Flags",
      align: "center",
      hideOnMobile: true,
      render: (row) => (
        <Box className="flex items-center gap-1 justify-center flex-wrap">
          {row.isSpam && (
            <Chip size="small" color="error" icon={<ReportOutlinedIcon fontSize="small" />} label="Spam" />
          )}
          {row.isArchived && <Chip size="small" variant="outlined" label="Archived" />}
          {!row.isSpam && !row.isArchived && (
            <Typography variant="caption" color="text.disabled">
              —
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: "createdAt",
      headerName: "Received",
      sortable: true,
      hideOnMobile: true,
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {relativeTime(row.createdAt)}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle="Contact form submissions from your portfolio's visitors."
        badge={typeof data?.total === "number" ? <Chip size="small" variant="outlined" label={`${data.total} total`} /> : null}
      />

      <DataTable
        columns={columns}
        rows={messages}
        getRowId={(row) => row._id}
        loading={isLoading}
        fetching={isFetching}
        error={isError ? error?.message : null}
        onRetry={refetch}
        emptyIcon={<MailOutlineIcon fontSize="large" />}
        emptyTitle={filters.folder === "inbox" ? "Inbox is empty" : "No messages here"}
        emptyDescription="Messages submitted via the contact form will appear here."
        sortModel={{ field: filters.sortBy, direction: filters.sortOrder }}
        onSortChange={handleSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        toolbar={
          <ToolbarBar
            searchValue={filters.search}
            onSearchChange={(v) => {
              setFilter("search", v);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email, or message…"
            filters={
              <Box className="flex flex-wrap items-center gap-2">
                <FilterBar
                  filters={[
                    {
                      label: "Folder",
                      value: filters.folder,
                      onChange: (v) => {
                        setFilter("folder", v);
                        setPage(1);
                      },
                      options: FOLDER_OPTIONS,
                    },
                    {
                      label: "Status",
                      value: filters.status,
                      onChange: (v) => {
                        setFilter("status", v);
                        setPage(1);
                      },
                      options: STATUS_OPTIONS,
                    },
                  ]}
                />
                <TextField
                  size="small"
                  type="date"
                  label="From"
                  value={filters.dateFrom}
                  onChange={(e) => {
                    setFilter("dateFrom", e.target.value);
                    setPage(1);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ width: 150 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="To"
                  value={filters.dateTo}
                  onChange={(e) => {
                    setFilter("dateTo", e.target.value);
                    setPage(1);
                  }}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ width: 150 }}
                />
              </Box>
            }
            selectedCount={selectedIds.size}
            bulkActions={
              <Box className="flex items-center gap-1.5 flex-wrap">
                <RequirePermission permission={PERMISSIONS.MESSAGES_EDIT}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MarkEmailReadOutlinedIcon fontSize="small" />}
                    onClick={handleBulkMarkRead}
                    disabled={bulkBusy}
                  >
                    Mark read
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MarkEmailUnreadOutlinedIcon fontSize="small" />}
                    onClick={handleBulkMarkUnread}
                    disabled={bulkBusy}
                  >
                    Mark unread
                  </Button>
                  {showRestore ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UnarchiveOutlinedIcon fontSize="small" />}
                      onClick={handleBulkRestore}
                      disabled={bulkBusy}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ArchiveOutlinedIcon fontSize="small" />}
                      onClick={handleBulkArchive}
                      disabled={bulkBusy}
                    >
                      Archive
                    </Button>
                  )}
                </RequirePermission>
                <RequirePermission permission={PERMISSIONS.MESSAGES_DELETE}>
                  <Button
                    size="small"
                    color="error"
                    variant="contained"
                    startIcon={<DeleteOutlineIcon fontSize="small" />}
                    onClick={handleBulkDelete}
                    disabled={bulkBusy}
                  >
                    Delete
                  </Button>
                </RequirePermission>
              </Box>
            }
          />
        }
        pagination={{
          page,
          totalPages: data?.totalPages ?? 1,
          totalCount: data?.total,
          onPageChange: setPage,
        }}
        rowActions={(row) => (
          <>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => handleOpenDetails(row)} aria-label={`View message from ${row.fullname}`}>
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <RequirePermission permission={PERMISSIONS.MESSAGES_EDIT}>
              <Tooltip title={row.status === "unread" ? "Mark as read" : "Mark as unread"}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleRead(row)}
                  aria-label={
                    row.status === "unread"
                      ? `Mark ${row.fullname}'s message as read`
                      : `Mark ${row.fullname}'s message as unread`
                  }
                >
                  {row.status === "unread" ? (
                    <MarkEmailReadOutlinedIcon fontSize="small" />
                  ) : (
                    <MarkEmailUnreadOutlinedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
            </RequirePermission>
            <RequirePermission permission={PERMISSIONS.MESSAGES_EDIT}>
              <Tooltip title={row.isArchived ? "Restore to inbox" : "Archive"}>
                <IconButton
                  size="small"
                  onClick={() => handleToggleArchive(row)}
                  aria-label={row.isArchived ? `Restore ${row.fullname}'s message` : `Archive ${row.fullname}'s message`}
                >
                  {row.isArchived ? <UnarchiveOutlinedIcon fontSize="small" /> : <ArchiveOutlinedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </RequirePermission>
            <RequirePermission permission={PERMISSIONS.MESSAGES_DELETE}>
              <Tooltip title="Delete">
                <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label={`Delete message from ${row.fullname}`}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </RequirePermission>
          </>
        )}
      />

      <MessageDetailsDrawer
        open={!!detailsMessage}
        message={detailsMessage}
        onClose={handleCloseDetails}
        onToggleRead={handleToggleRead}
        onToggleArchive={handleToggleArchive}
        onToggleSpam={handleToggleSpam}
        onDelete={async (row) => {
          const deleted = await handleDelete(row);
          if (deleted) handleCloseDetails();
        }}
      />
    </>
  );
}
