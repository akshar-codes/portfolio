import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import PublishOutlinedIcon from "@mui/icons-material/PublishOutlined";
import UnpublishedOutlinedIcon from "@mui/icons-material/UnpublishedOutlined";
import StarIcon from "@mui/icons-material/Star";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";

import PageHeader from "../../components/common/PageHeader";
import ToolbarBar from "../../components/common/Toolbar";
import FilterBar from "../../components/common/FilterBar";
import DataTable from "../../components/table/DataTable";
import DragReorderList from "../../components/cms/DragReorderList";
import RequirePermission from "../../components/auth/RequirePermission";
import ProjectDetails from "./ProjectDetails";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFilters } from "../../hooks/useFilters";
import { usePagination } from "../../hooks/usePagination";
import { useCategoriesQuery } from "../../hooks/useCategories";
import {
  useAdminProjectsQuery,
  useDeleteProject,
  useReorderProjects,
  usePublishProject,
  useUnpublishProject,
} from "../../hooks/useProjects";
import { projectsApi } from "../../api/projectsApi";
import { PERMISSIONS } from "../../constants/permissions";
import { ROUTES } from "../../constants/routes";
import { flattenTechNames } from "../../utils/projectHelpers";

const PROJECTS_ADMIN_PAGE_SIZE = 10;
// Matches backend MAX_PAGE_SIZE (utils/constants.js). Reorder mode
// fetches a single unpaginated page up to this cap — see the note on
// canReorder below for what happens past this count.
const MAX_REORDER_ITEMS = 50;

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

const FEATURED_OPTIONS = [
  { label: "All projects", value: "" },
  { label: "Featured only", value: "true" },
  { label: "Not featured", value: "false" },
];

function stripHtml(html = "") {
  return html.replace(/<[^>]*>/g, "");
}

/* ------------------------------------------------------------------ *
 * ProjectReorderPanel
 * ------------------------------------------------------------------ */
function ProjectReorderPanel({ items, onReorder, onSave, onCancel, saving, truncated }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Box className="flex items-center justify-between mb-3">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Reorder projects
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drag rows to set the display order used across the public portfolio grid.
            {truncated && ` Showing the first ${MAX_REORDER_ITEMS} projects.`}
          </Typography>
        </Box>
        <Box className="flex items-center gap-1.5">
          <Button size="small" color="inherit" startIcon={<CloseIcon fontSize="small" />} onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button size="small" variant="contained" startIcon={<CheckIcon fontSize="small" />} onClick={onSave} disabled={saving}>
            {saving ? "Saving…" : "Save order"}
          </Button>
        </Box>
      </Box>

      <DragReorderList
        items={items}
        getId={(item) => item._id}
        onReorder={onReorder}
        disabled={saving}
        renderItem={({ item, index }) => (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%", display: "flex", alignItems: "center", gap: 1.5 }}>
            <DragIndicatorIcon fontSize="small" sx={{ color: "text.disabled" }} />
            <Typography variant="caption" color="text.disabled" sx={{ width: 24 }}>
              {index + 1}
            </Typography>
            <Box
              sx={{ width: 44, height: 32, borderRadius: 1, overflow: "hidden", bgcolor: "action.hover", flexShrink: 0 }}
            >
              <img
                src={item.image?.url || "/images/placeholder.png"}
                alt={item.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <Typography fontWeight={600} fontSize={14} sx={{ flex: 1 }} noWrap>
              {item.title}
            </Typography>
            {item.featured && <Chip size="small" color="warning" icon={<StarIcon fontSize="small" />} label="Featured" />}
          </Paper>
        )}
      />
    </Paper>
  );
}

/* ================================================================== *
 * Main ManageProjects component
 * ================================================================== */
export default function ManageProjects() {
  const navigate = useNavigate();
  const { filters, setFilter } = useFilters({
    search: "",
    status: "",
    category: "",
    featured: "",
    sortBy: "order",
    sortOrder: "asc",
  });
  const debouncedSearch = useDebouncedValue(filters.search, 350);
  const { page, limit, setPage } = usePagination({ initialLimit: PROJECTS_ADMIN_PAGE_SIZE });

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      featured: filters.featured || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [page, limit, debouncedSearch, filters.status, filters.category, filters.featured, filters.sortBy, filters.sortOrder],
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useAdminProjectsQuery(queryParams);
  const { data: categories = [] } = useCategoriesQuery();
  const { mutateAsync: deleteProject } = useDeleteProject();
  const { mutateAsync: reorderProjects, isPending: savingOrder } = useReorderProjects();
  const { mutateAsync: publishProject } = usePublishProject();
  const { mutateAsync: unpublishProject } = useUnpublishProject();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [previewProject, setPreviewProject] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderItems, setReorderItems] = useState(null);
  const [reorderTruncated, setReorderTruncated] = useState(false);
  const [loadingReorder, setLoadingReorder] = useState(false);

  const confirm = useConfirmDialog();
  const { showLoading, hideLoading } = useGlobalLoading();

  const projects = data?.projects ?? [];
  const canReorder = !filters.search && !filters.status && !filters.category && !filters.featured;

  const handleSort = (field) => {
    const nextOrder = filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";
    setFilter("sortBy", field);
    setFilter("sortOrder", nextOrder);
    setPage(1);
  };

  const handleDelete = async (project) => {
    const confirmed = await confirm({
      title: `Delete "${project.title}"?`,
      description: "This will permanently remove the project and all its images.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteProject(project._id);
      toast.success(`"${project.title}" deleted.`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(project._id);
        return next;
      });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;

    const confirmed = await confirm({
      title: `Delete ${ids.length} project${ids.length === 1 ? "" : "s"}?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete all",
      tone: "danger",
    });
    if (!confirmed) return;

    setBulkDeleting(true);
    showLoading(`Deleting ${ids.length} project${ids.length === 1 ? "" : "s"}…`);

    const results = await Promise.allSettled(ids.map((id) => deleteProject(id)));

    hideLoading();
    setBulkDeleting(false);
    setSelectedIds(new Set());

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast.success(`${ids.length} project${ids.length === 1 ? "" : "s"} deleted.`);
    } else {
      toast.error(`${failed} of ${ids.length} projects could not be deleted.`);
    }
  };

  const handleTogglePublish = async (project) => {
    try {
      if (project.status === "draft") {
        await publishProject(project._id);
        toast.success(`"${project.title}" published.`);
      } else {
        await unpublishProject(project._id);
        toast.success(`"${project.title}" unpublished.`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const enterReorderMode = async () => {
    setLoadingReorder(true);
    try {
      const result = await projectsApi.list({ page: 1, limit: MAX_REORDER_ITEMS, sortBy: "order", sortOrder: "asc" });
      setReorderItems(result.projects ?? []);
      setReorderTruncated((result.total ?? 0) > MAX_REORDER_ITEMS);
      setReorderMode(true);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoadingReorder(false);
    }
  };

  const handleSaveReorder = async () => {
    try {
      await reorderProjects(reorderItems.map((p) => p._id));
      toast.success("Project order saved.");
      setReorderMode(false);
      setReorderItems(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      field: "image",
      headerName: "Image",
      width: 64,
      render: (row) => (
        <Box sx={{ width: 52, height: 38, borderRadius: 1.5, overflow: "hidden", bgcolor: "action.hover" }}>
          <img
            src={row.image?.url || "/images/placeholder.png"}
            alt={row.title}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
      ),
    },
    {
      field: "title",
      headerName: "Title",
      sortable: true,
      render: (row) => (
        <Box sx={{ maxWidth: 280 }}>
          <Typography fontWeight={600} fontSize={14} noWrap>
            {row.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
            {stripHtml(row.description ?? "").slice(0, 90)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "category",
      headerName: "Category",
      hideOnMobile: true,
      render: (row) => <Chip size="small" label={row.category?.name ?? "—"} />,
    },
    {
      field: "technologies",
      headerName: "Technologies",
      hideOnMobile: true,
      render: (row) => {
        const names = flattenTechNames(row.technologies);
        if (names.length === 0) return <Typography variant="caption" color="text.disabled">—</Typography>;
        return (
          <Typography variant="caption" color="text.secondary">
            {names.slice(0, 3).join(", ")}
            {names.length > 3 && ` +${names.length - 3}`}
          </Typography>
        );
      },
    },
    {
      field: "status",
      headerName: "Status",
      align: "center",
      render: (row) => (
        <Chip
          size="small"
          variant={row.status === "draft" ? "outlined" : "filled"}
          color={row.status === "draft" ? "default" : "success"}
          label={row.status === "draft" ? "Draft" : "Published"}
        />
      ),
    },
    {
      field: "featured",
      headerName: "Featured",
      align: "center",
      render: (row) =>
        row.featured ? (
          <Chip size="small" color="warning" icon={<StarIcon fontSize="small" />} label="Featured" />
        ) : (
          <Typography variant="caption" color="text.disabled">—</Typography>
        ),
    },
    {
      field: "createdAt",
      headerName: "Created",
      hideOnMobile: true,
      sortable: true,
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          {new Date(row.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
        </Typography>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Manage your portfolio projects — content, media, technologies, and SEO."
        badge={typeof data?.total === "number" ? <Chip size="small" variant="outlined" label={`${data.total} total`} /> : null}
        actions={
          <Box className="flex items-center gap-2 flex-wrap">
            <RequirePermission permission={PERMISSIONS.PROJECTS_REORDER}>
              <Tooltip title={canReorder ? "" : "Clear search/filters to reorder"}>
                <span>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DragIndicatorIcon fontSize="small" />}
                    onClick={enterReorderMode}
                    disabled={!canReorder || reorderMode || loadingReorder}
                  >
                    {loadingReorder ? "Loading…" : "Reorder"}
                  </Button>
                </span>
              </Tooltip>
            </RequirePermission>
            <RequirePermission permission={PERMISSIONS.PROJECTS_CREATE}>
              <Button component={Link} to={ROUTES.adminProjectsNew} variant="contained" startIcon={<AddIcon />}>
                Add Project
              </Button>
            </RequirePermission>
          </Box>
        }
      />

      {reorderMode && reorderItems && (
        <ProjectReorderPanel
          items={reorderItems}
          onReorder={setReorderItems}
          onSave={handleSaveReorder}
          onCancel={() => {
            setReorderMode(false);
            setReorderItems(null);
          }}
          saving={savingOrder}
          truncated={reorderTruncated}
        />
      )}

      <DataTable
        columns={columns}
        rows={projects}
        getRowId={(row) => row._id}
        loading={isLoading}
        fetching={isFetching}
        error={isError ? error?.message : null}
        onRetry={refetch}
        emptyIcon={<WorkOutlineIcon fontSize="large" />}
        emptyTitle="No projects yet"
        emptyDescription="Click Add Project above to publish your first one."
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
            searchPlaceholder="Search projects…"
            filters={
              <FilterBar
                filters={[
                  {
                    label: "Status",
                    value: filters.status,
                    onChange: (v) => {
                      setFilter("status", v);
                      setPage(1);
                    },
                    options: STATUS_OPTIONS,
                  },
                  {
                    label: "Category",
                    value: filters.category,
                    onChange: (v) => {
                      setFilter("category", v);
                      setPage(1);
                    },
                    options: [{ label: "All categories", value: "" }, ...categories.map((c) => ({ label: c.name, value: c._id }))],
                  },
                  {
                    label: "Featured",
                    value: filters.featured,
                    onChange: (v) => {
                      setFilter("featured", v);
                      setPage(1);
                    },
                    options: FEATURED_OPTIONS,
                  },
                ]}
              />
            }
            selectedCount={selectedIds.size}
            bulkActions={
              <RequirePermission permission={PERMISSIONS.PROJECTS_DELETE}>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<DeleteOutlineIcon fontSize="small" />}
                  disabled={bulkDeleting}
                  onClick={handleBulkDelete}
                >
                  Delete selected
                </Button>
              </RequirePermission>
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
            <IconButton size="small" onClick={() => setPreviewProject(row)} aria-label={`Preview ${row.title}`}>
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
            <RequirePermission permission={PERMISSIONS.PROJECTS_EDIT}>
              <IconButton
                size="small"
                onClick={() => handleTogglePublish(row)}
                aria-label={row.status === "draft" ? `Publish ${row.title}` : `Unpublish ${row.title}`}
                title={row.status === "draft" ? "Publish" : "Unpublish"}
              >
                {row.status === "draft" ? <PublishOutlinedIcon fontSize="small" /> : <UnpublishedOutlinedIcon fontSize="small" />}
              </IconButton>
            </RequirePermission>
            <RequirePermission permission={PERMISSIONS.PROJECTS_EDIT}>
              <IconButton
                size="small"
                onClick={() => navigate(`${ROUTES.adminProjects}/${row._id}/edit`)}
                aria-label={`Edit ${row.title}`}
              >
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </RequirePermission>
            <RequirePermission permission={PERMISSIONS.PROJECTS_DELETE}>
              <IconButton size="small" color="error" onClick={() => handleDelete(row)} aria-label={`Delete ${row.title}`}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </RequirePermission>
          </>
        )}
      />

      {previewProject && <ProjectDetails project={previewProject} onClose={() => setPreviewProject(null)} />}
    </>
  );
}
