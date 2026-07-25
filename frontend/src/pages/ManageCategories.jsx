import { useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import PageHeader from "../../components/admin/PageHeader";
import ToolbarBar from "../../components/admin/Toolbar";
import FilterBar from "../../components/admin/FilterBar";
import DataTable from "../../components/admin/table/DataTable";
import { TextField } from "../../components/admin/form/fields";
import RequirePermission from "../../components/common/RequirePermission";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import { useGlobalLoading } from "../../hooks/useGlobalLoading";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useFilters } from "../../hooks/useFilters";
import { useCategoriesQuery, useCreateCategory, useDeleteCategory } from "../../hooks/useCategories";
import { categorySchema, categoryFormDefaults } from "../../validators/categorySchema";
import { PERMISSIONS } from "../../constants/permissions";

const STATUS_OPTIONS = [
  { label: "All statuses", value: "" },
  { label: "Published", value: "published" },
  { label: "Draft", value: "draft" },
];

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
  const { mutateAsync: deleteCategory } = useDeleteCategory();

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const confirm = useConfirmDialog();
  const { showLoading, hideLoading } = useGlobalLoading();

  const form = useForm({ resolver: zodResolver(categorySchema), defaultValues: categoryFormDefaults });

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

  const columns = [
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
      />

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
          <RequirePermission permission={PERMISSIONS.CATEGORIES_DELETE}>
            <Button
              size="small"
              color="error"
              variant="text"
              startIcon={<DeleteOutlineIcon fontSize="small" />}
              disabled={row.projectCount > 0}
              onClick={() => handleDeleteOne(row)}
            >
              Delete
            </Button>
          </RequirePermission>
        )}
      />

      {categories?.some((c) => c.projectCount > 0) && (
        <p className="text-xs text-gray-500 mt-3">
          Categories in use cannot be deleted. Reassign or remove their projects first.
        </p>
      )}
    </>
  );
}
