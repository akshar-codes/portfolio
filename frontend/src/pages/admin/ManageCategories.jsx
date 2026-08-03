import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

import PageHeader from "../../components/common/PageHeader";
import ToolbarBar from "../../components/common/Toolbar";
import FilterBar from "../../components/common/FilterBar";
import DataTable from "../../components/table/DataTable";
import { TextField, SelectField } from "../../components/form/fields";
import DragReorderList from "../../components/cms/DragReorderList";
import RequirePermission from "../../components/auth/RequirePermission";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFilters } from "../../hooks/useFilters";
import {
  useCategoriesQuery,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useReorderCategories,
} from "../../hooks/useCategories";
import {
  categorySchema,
  categoryFormDefaults,
  categoryEditSchema,
  categoryEditFormDefaults,
} from "../../schemas/categorySchema";
import { PERMISSIONS } from "../../constants/permissions";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

const STATUS_FORM_OPTIONS = [
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

/* ------------------------------------------------------------------ *
 * CategoryEditDialog — rename + change publish status
 * ------------------------------------------------------------------ */
function CategoryEditDialog({ open, category, onClose, onSave, saving }) {
  const form = useForm({
    resolver: zodResolver(categoryEditSchema),
    defaultValues: categoryEditFormDefaults,
  });

  useEffect(() => {
    if (open && category) {
      form.reset({ name: category.name, status: category.status ?? "published" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((values) => onSave(values))}
          noValidate
        >
          <DialogTitle fontWeight={700}>Edit category</DialogTitle>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 3 }}>
            <TextField name="name" label="Category name" required maxLength={80} />
            <SelectField name="status" label="Status" options={STATUS_FORM_OPTIONS} required />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={onClose} color="inherit" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ *
 * CategoryReorderPanel — drag-and-drop display order editor
 * ------------------------------------------------------------------ */
function CategoryReorderPanel({ items, onReorder, onSave, onCancel, saving }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
      <Box className="flex items-center justify-between mb-3">
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>
            Reorder categories
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Drag rows to set the display order used across the public site.
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
            <Typography fontWeight={600} fontSize={14} sx={{ flex: 1 }}>
              {item.name}
            </Typography>
            <Chip size="small" label={`${item.projectCount} project${item.projectCount === 1 ? "" : "s"}`} />
          </Paper>
        )}
      />
    </Paper>
  );
}

/* ================================================================== *
 * Main ManageCategories component
 * ================================================================== */
export default function ManageCategories() {
  const { filters, setFilter } = useFilters({ search: "", status: "", sortBy: "name", sortOrder: "asc" });
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const queryParams = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [debouncedSearch, filters.status, filters.sortBy, filters.sortOrder],
  );

  const { data: categories, isLoading, isFetching, isError, error, refetch } = useCategoriesQuery(queryParams);
  const { mutateAsync: createCategory, isPending: adding } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: savingEdit } = useUpdateCategory();
  const { mutateAsync: deleteCategory } = useDeleteCategory();
  const { mutateAsync: reorderCategories, isPending: savingOrder } = useReorderCategories();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [reorderMode, setReorderMode] = useState(false);
  const [reorderItems, setReorderItems] = useState(null);

  const confirm = useConfirmDialog();
  const { showLoading, hideLoading } = useGlobalLoading();

  const form = useForm({ resolver: zodResolver(categorySchema), defaultValues: categoryFormDefaults });

  // Categories aren't paginated server-side (see services/categoryService.js
  // fetchAllCategories), so whatever the table currently has loaded IS the
  // complete set — reordering just requires it to be unfiltered.
  const canReorder = !filters.search && !filters.status;

  const handleAdd = async (values) => {
    try {
      await createCategory(values);
      form.reset(categoryFormDefaults);
      toast.success("Category created successfully.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSort = (field) => {
    const nextOrder = filters.sortBy === field && filters.sortOrder === "asc" ? "desc" : "asc";
    setFilter("sortBy", field);
    setFilter("sortOrder", nextOrder);
  };

  const handleSaveEdit = async (values) => {
    try {
      await updateCategory({ id: editingCategory._id, payload: values });
      toast.success(`Category "${values.name}" updated.`);
      setEditingCategory(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteOne = async (category) => {
    const confirmed = await confirm({
      title: `Delete "${category.name}"?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteCategory(category._id);
      toast.success(`Category "${category.name}" deleted.`);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(category._id);
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
      title: `Delete ${ids.length} categor${ids.length === 1 ? "y" : "ies"}?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete all",
      tone: "danger",
    });
    if (!confirmed) return;

    setBulkDeleting(true);
    showLoading(`Deleting ${ids.length} categor${ids.length === 1 ? "y" : "ies"}…`);

    const results = await Promise.allSettled(ids.map((id) => deleteCategory(id)));

    hideLoading();
    setBulkDeleting(false);
    setSelectedIds(new Set());

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed === 0) {
      toast.success(`${ids.length} categor${ids.length === 1 ? "y" : "ies"} deleted.`);
    } else {
      toast.error(`${failed} of ${ids.length} categories could not be deleted.`);
    }
  };

  const enterReorderMode = () => {
    const sorted = [...(categories ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setReorderItems(sorted);
    setReorderMode(true);
  };

  const handleSaveReorder = async () => {
    try {
      await reorderCategories(reorderItems.map((c) => c._id));
      toast.success("Category order saved.");
      setReorderMode(false);
      setReorderItems(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const columns = [
    {
      field: "order",
      headerName: "Order",
      width: 80,
      align: "center",
      sortable: true,
      render: (row) => (
        <Typography variant="caption" color="text.secondary">
          #{(row.order ?? 0) + 1}
        </Typography>
      ),
    },
    {
      field: "name",
      headerName: "Name",
      sortable: true,
      render: (row) => <span className="font-semibold text-sm">{row.name}</span>,
    },
    {
      field: "slug",
      headerName: "Slug",
      hideOnMobile: true,
      render: (row) => <code className="text-xs bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded">{row.slug}</code>,
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
      field: "projectCount",
      headerName: "Projects",
      align: "center",
      width: 140,
      sortable: true,
      render: (row) => (
        <Chip
          size="small"
          label={`${row.projectCount} ${row.projectCount === 1 ? "project" : "projects"}`}
          color={row.projectCount > 0 ? "primary" : "default"}
          variant={row.projectCount > 0 ? "filled" : "outlined"}
        />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Organize your portfolio projects into browsable categories."
        badge={
          typeof categories?.length === "number" ? <Chip size="small" variant="outlined" label={`${categories.length} total`} /> : null
        }
        actions={
          <RequirePermission permission={PERMISSIONS.CATEGORIES_EDIT}>
            <Tooltip title={canReorder ? "" : "Clear search/status filters to reorder"}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DragIndicatorIcon fontSize="small" />}
                  onClick={enterReorderMode}
                  disabled={!canReorder || reorderMode || (categories?.length ?? 0) < 2}
                >
                  Reorder
                </Button>
              </span>
            </Tooltip>
          </RequirePermission>
        }
      />

      {reorderMode && reorderItems && (
        <CategoryReorderPanel
          items={reorderItems}
          onReorder={setReorderItems}
          onSave={handleSaveReorder}
          onCancel={() => {
            setReorderMode(false);
            setReorderItems(null);
          }}
          saving={savingOrder}
        />
      )}

      {/*
        Deliberately not using FormLayout here — that component's card
        chrome and footer are built for multi-field resource forms
        (Profile, Resume, Project edit). A single-field inline row just
        needs FormProvider + the shared TextField, wired to the same
        RHF + Zod pattern every other form will use.
      */}
      <RequirePermission permission={PERMISSIONS.CATEGORIES_CREATE}>
        <FormProvider {...form}>
          <Box
            component="form"
            onSubmit={form.handleSubmit(handleAdd)}
            className="flex flex-col sm:flex-row gap-3 items-start mb-5 p-4 rounded-2xl"
            sx={{ border: "1px solid", borderColor: "divider" }}
          >
            <div className="flex-1 w-full">
              <TextField name="name" label="New category name" placeholder="e.g. Mobile Development" required maxLength={80} />
            </div>
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              disabled={adding}
              sx={{ flexShrink: 0, mt: { xs: 0, sm: 0.25 } }}
            >
              {adding ? "Adding…" : "Add category"}
            </Button>
          </Box>
        </FormProvider>
      </RequirePermission>

      <DataTable
        columns={columns}
        rows={categories ?? []}
        getRowId={(row) => row._id}
        isRowSelectable={(row) => row.projectCount === 0}
        loading={isLoading}
        fetching={isFetching}
        error={isError ? error?.message : null}
        onRetry={refetch}
        emptyIcon={<CategoryOutlinedIcon fontSize="large" />}
        emptyTitle="No categories yet"
        emptyDescription="Add your first category above, then assign it to projects."
        sortModel={{ field: filters.sortBy, direction: filters.sortOrder }}
        onSortChange={handleSort}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        toolbar={
          <ToolbarBar
            searchValue={filters.search}
            onSearchChange={(v) => setFilter("search", v)}
            searchPlaceholder="Search categories…"
            filters={
              <FilterBar
                filters={[{ label: "Status", value: filters.status, onChange: (v) => setFilter("status", v), options: STATUS_OPTIONS }]}
              />
            }
            selectedCount={selectedIds.size}
            bulkActions={
              <RequirePermission permission={PERMISSIONS.CATEGORIES_DELETE}>
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
        rowActions={(row) => (
          <>
            <RequirePermission permission={PERMISSIONS.CATEGORIES_EDIT}>
              <IconButton size="small" onClick={() => setEditingCategory(row)} aria-label={`Edit ${row.name}`}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </RequirePermission>
            <RequirePermission permission={PERMISSIONS.CATEGORIES_DELETE}>
              <IconButton
                size="small"
                color="error"
                disabled={row.projectCount > 0}
                title={
                  row.projectCount > 0
                    ? `Cannot delete — ${row.projectCount} project${row.projectCount === 1 ? "" : "s"} use this category`
                    : "Delete category"
                }
                onClick={() => handleDeleteOne(row)}
                aria-label={`Delete ${row.name}`}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </RequirePermission>
          </>
        )}
      />

      {categories?.some((c) => c.projectCount > 0) && (
        <p className="text-xs text-gray-500 mt-3">
          Categories in use cannot be deleted. Reassign or remove their projects first.
        </p>
      )}

      <CategoryEditDialog
        open={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSave={handleSaveEdit}
        saving={savingEdit}
      />
    </>
  );
}
