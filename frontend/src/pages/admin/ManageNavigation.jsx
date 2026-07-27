import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiTextField from "@mui/material/TextField";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";

import PageHeader from "../../components/common/PageHeader";
import DragReorderList from "../../components/common/DragReorderList";
import { TextField as RHFTextField, SwitchField } from "../../components/form/fields";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  useAdminNavigationQuery,
  useUpdateNavigation,
  usePublishNavigation,
  useUnpublishNavigation,
} from "../../hooks/useNavigation";
import { navItemFormSchema, navItemFormDefaults } from "../../schemas/navigationSchema";

const MAX_ITEMS = 20;
const MAX_CHILDREN = 10;

/* ================================================================== *
 * Helpers
 * ================================================================== */

function withTempIds(items = []) {
  return items.map((item) => ({
    ...item,
    _tempId: item._id ?? crypto.randomUUID(),
    children: (item.children ?? []).map((child) => ({
      ...child,
      _tempId: child._id ?? crypto.randomUUID(),
    })),
  }));
}

function stripForCompare(items = []) {
  return items.map(({ label, path, isExternal, openInNewTab, visible, children }) => ({
    label,
    path,
    isExternal,
    openInNewTab,
    visible,
    children: (children ?? []).map((c) => ({
      label: c.label,
      path: c.path,
      isExternal: c.isExternal,
      openInNewTab: c.openInNewTab,
      visible: c.visible,
    })),
  }));
}

function stripForSubmit(items = []) {
  return items.map((item, order) => ({
    ...(item._id ? { _id: item._id } : {}),
    label: item.label,
    path: item.path,
    isExternal: item.isExternal,
    openInNewTab: item.openInNewTab,
    visible: item.visible,
    order,
    children: (item.children ?? []).map((child, childOrder) => ({
      ...(child._id ? { _id: child._id } : {}),
      label: child.label,
      path: child.path,
      isExternal: child.isExternal,
      openInNewTab: child.openInNewTab,
      visible: child.visible,
      order: childOrder,
    })),
  }));
}

/* ================================================================== *
 * NavItemFormDialog — create/edit a top-level item OR a dropdown child
 * ================================================================== */
function NavItemFormDialog({ open, initialValues, isChild, onClose, onSave }) {
  const form = useForm({
    resolver: zodResolver(navItemFormSchema),
    defaultValues: navItemFormDefaults,
  });

  useEffect(() => {
    if (open) form.reset(initialValues ?? navItemFormDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const handleSubmit = form.handleSubmit((values) => {
    onSave(values);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <FormProvider {...form}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <DialogTitle fontWeight={700}>{isChild ? "Dropdown item" : "Navigation item"}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="label" label="Label" required maxLength={50} />
              <RHFTextField
                name="path"
                label="Path or URL"
                required
                maxLength={2048}
                placeholder="/services or https://…"
              />
              <SwitchField name="isExternal" label="External link (opens outside the site)" />
              <SwitchField name="openInNewTab" label="Open in a new tab" />
              <SwitchField name="visible" label="Visible on the public site" />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </DialogActions>
        </Box>
      </FormProvider>
    </Dialog>
  );
}

/* ================================================================== *
 * CtaForm — the "Hire me" style call-to-action button config
 * ================================================================== */
function CtaForm({ value, onChange, disabled }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Call-to-action button
      </Typography>
      <Stack spacing={2.5} sx={{ maxWidth: 420 }}>
        <FormControlLabel
          control={
            <Switch
              checked={value.ctaEnabled}
              onChange={(e) => onChange({ ...value, ctaEnabled: e.target.checked })}
              disabled={disabled}
            />
          }
          label="Enabled"
        />
        <MuiTextField
          size="small"
          label="Button label"
          value={value.ctaLabel}
          onChange={(e) => onChange({ ...value, ctaLabel: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 40 } }}
          disabled={disabled}
        />
        <MuiTextField
          size="small"
          label="Button URL"
          value={value.ctaUrl}
          onChange={(e) => onChange({ ...value, ctaUrl: e.target.value })}
          placeholder="/contact or https://…"
          slotProps={{ htmlInput: { maxLength: 2048 } }}
          disabled={disabled}
        />
      </Stack>
    </Paper>
  );
}

/* ================================================================== *
 * NavPreview — static hierarchy preview (hover to reveal dropdowns)
 * ================================================================== */
function NavPreview({ items, cta }) {
  const visibleItems = items.filter((i) => i.visible);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        px: 2.5,
        py: 1.5,
        borderRadius: 2,
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        overflowX: "auto",
      }}
    >
      {visibleItems.length === 0 && (
        <Typography variant="caption" color="text.disabled">
          No visible items
        </Typography>
      )}
      {visibleItems.map((item) => {
        const visibleChildren = (item.children ?? []).filter((c) => c.visible);
        return (
          <Box key={item._tempId} className="relative group" sx={{ flexShrink: 0 }}>
            <Typography
              fontSize={13}
              fontWeight={500}
              sx={{ cursor: "default", display: "flex", alignItems: "center", gap: 0.5 }}
            >
              {item.label}
              {item.isExternal && <OpenInNewIcon sx={{ fontSize: 12 }} />}
            </Typography>
            {visibleChildren.length > 0 && (
              <Box
                className="hidden group-hover:flex"
                sx={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  mt: 1,
                  flexDirection: "column",
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  boxShadow: 3,
                  minWidth: 160,
                  zIndex: 1,
                  py: 0.5,
                }}
              >
                {visibleChildren.map((child) => (
                  <Typography key={child._tempId} fontSize={12} sx={{ px: 1.5, py: 0.75 }}>
                    {child.label}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        );
      })}
      {cta.ctaEnabled && <Chip label={cta.ctaLabel || "CTA"} size="small" color="primary" sx={{ ml: "auto" }} />}
    </Box>
  );
}

/* ================================================================== *
 * Main ManageNavigation component
 * ================================================================== */
export default function ManageNavigation() {
  const { data, isLoading, isError, error, refetch } = useAdminNavigationQuery();
  const { mutateAsync: updateNavigation, isPending: saving } = useUpdateNavigation();
  const { mutateAsync: publish, isPending: publishing } = usePublishNavigation();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishNavigation();
  const confirm = useConfirmDialog();

  const [localItems, setLocalItems] = useState(null);
  const [serverItems, setServerItems] = useState(null);
  const [cta, setCta] = useState(null);
  const [serverCta, setServerCta] = useState(null);
  const [itemDialog, setItemDialog] = useState(null);

  useEffect(() => {
    if (data && localItems === null) {
      const seeded = withTempIds(
        [...(data.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      setLocalItems(seeded);
      setServerItems(seeded);
      const ctaValue = { ctaEnabled: data.ctaEnabled, ctaLabel: data.ctaLabel, ctaUrl: data.ctaUrl };
      setCta(ctaValue);
      setServerCta(ctaValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isDirty = useMemo(() => {
    if (!localItems || !serverItems || !cta || !serverCta) return false;
    const itemsDirty =
      JSON.stringify(stripForCompare(localItems)) !== JSON.stringify(stripForCompare(serverItems));
    const ctaDirty = JSON.stringify(cta) !== JSON.stringify(serverCta);
    return itemsDirty || ctaDirty;
  }, [localItems, serverItems, cta, serverCta]);

  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /* ── Top-level / child item CRUD ─────────────────────────────── */
  const openAddItem = () => setItemDialog({ mode: "add", isChild: false, initialValues: null });
  const openEditItem = (item) =>
    setItemDialog({ mode: "edit", isChild: false, tempId: item._tempId, initialValues: item });
  const openAddChild = (parentTempId) => setItemDialog({ mode: "add", isChild: true, parentTempId, initialValues: null });
  const openEditChild = (parentTempId, child) =>
    setItemDialog({ mode: "edit", isChild: true, parentTempId, tempId: child._tempId, initialValues: child });

  const handleSaveItemDialog = (values) => {
    setLocalItems((prev) => {
      if (!itemDialog.isChild) {
        if (itemDialog.mode === "add") {
          return [...prev, { _tempId: crypto.randomUUID(), ...values, children: [] }];
        }
        return prev.map((it) => (it._tempId === itemDialog.tempId ? { ...it, ...values } : it));
      }
      return prev.map((it) => {
        if (it._tempId !== itemDialog.parentTempId) return it;
        if (itemDialog.mode === "add") {
          return { ...it, children: [...it.children, { _tempId: crypto.randomUUID(), ...values }] };
        }
        return {
          ...it,
          children: it.children.map((c) => (c._tempId === itemDialog.tempId ? { ...c, ...values } : c)),
        };
      });
    });
  };

  const handleDeleteItem = async (item) => {
    const confirmed = await confirm({
      title: `Delete "${item.label}"?`,
      description: item.children?.length
        ? "This will also remove its dropdown items."
        : "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;
    setLocalItems((prev) => prev.filter((it) => it._tempId !== item._tempId));
  };

  const handleDeleteChild = async (parentTempId, child) => {
    const confirmed = await confirm({ title: `Delete "${child.label}"?`, confirmLabel: "Delete", tone: "danger" });
    if (!confirmed) return;
    setLocalItems((prev) =>
      prev.map((it) =>
        it._tempId === parentTempId
          ? { ...it, children: it.children.filter((c) => c._tempId !== child._tempId) }
          : it,
      ),
    );
  };

  const handleReorderTop = (reordered) => setLocalItems(reordered);
  const handleReorderChildren = (parentTempId, reorderedChildren) =>
    setLocalItems((prev) =>
      prev.map((it) => (it._tempId === parentTempId ? { ...it, children: reorderedChildren } : it)),
    );

  /* ── Save / Discard ──────────────────────────────────────────── */
  const handleSave = async () => {
    try {
      const updated = await updateNavigation({ items: stripForSubmit(localItems), ...cta });
      const seeded = withTempIds(
        [...(updated.items ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      setLocalItems(seeded);
      setServerItems(seeded);
      const ctaValue = { ctaEnabled: updated.ctaEnabled, ctaLabel: updated.ctaLabel, ctaUrl: updated.ctaUrl };
      setCta(ctaValue);
      setServerCta(ctaValue);
      toast.success("Navigation saved.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDiscard = () => {
    setLocalItems(serverItems);
    setCta(serverCta);
  };

  const handleTogglePublish = async () => {
    try {
      if (data.status === "draft") {
        await publish();
        toast.success("Navigation published.");
      } else {
        await unpublish();
        toast.success("Navigation unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading || localItems === null || cta === null) {
    return (
      <Box className="flex items-center justify-center py-24">
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box className="py-12 text-center">
        <Typography color="error" className="mb-3">
          {error?.message}
        </Typography>
        <Button variant="outlined" onClick={refetch}>
          Try again
        </Button>
      </Box>
    );
  }

  const isDraft = data.status === "draft";

  return (
    <>
      <PageHeader
        title="Navigation"
        subtitle="Manage the links shown in the site header. Drag to reorder, add dropdown items for grouped menus."
        badge={
          <Chip
            size="small"
            variant={isDraft ? "outlined" : "filled"}
            color={isDraft ? "default" : "success"}
            label={isDraft ? "Draft" : "Published"}
          />
        }
        actions={
          <Button variant="outlined" size="small" onClick={handleTogglePublish} disabled={publishing || unpublishing}>
            {publishing || unpublishing ? "…" : isDraft ? "Publish" : "Unpublish"}
          </Button>
        }
      />

      {isDirty && (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            borderColor: "warning.main",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            You have unsaved changes.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" color="inherit" onClick={handleDiscard} disabled={saving}>
              Discard
            </Button>
            <Button size="small" variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" fontWeight={700}>
              Menu items
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={openAddItem} disabled={localItems.length >= MAX_ITEMS}>
              Add item
            </Button>
          </Box>

          {localItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-6 text-center">
              No navigation items yet — add your first one above.
            </Typography>
          ) : (
            <DragReorderList
              items={localItems}
              getId={(item) => item._tempId}
              onReorder={handleReorderTop}
              renderItem={({ item }) => (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box className="flex items-center justify-between gap-2 flex-wrap">
                    <Box className="flex items-center gap-2 min-w-0">
                      <Typography fontWeight={600} noWrap>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.path}
                      </Typography>
                      {item.isExternal && <OpenInNewIcon sx={{ fontSize: 14, color: "text.disabled" }} />}
                      {!item.visible && <VisibilityOffOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />}
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        startIcon={<AddIcon fontSize="small" />}
                        onClick={() => openAddChild(item._tempId)}
                        disabled={item.children.length >= MAX_CHILDREN}
                      >
                        Child
                      </Button>
                      <IconButton size="small" onClick={() => openEditItem(item)} aria-label={`Edit ${item.label}`}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteItem(item)} aria-label={`Delete ${item.label}`}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  {item.children.length > 0 && (
                    <Box sx={{ pl: 4, pt: 1.5, mt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
                      <DragReorderList
                        items={item.children}
                        getId={(child) => child._tempId}
                        onReorder={(reordered) => handleReorderChildren(item._tempId, reordered)}
                        renderItem={({ item: child }) => (
                          <Box className="flex items-center justify-between gap-2 flex-wrap">
                            <Box className="flex items-center gap-2 min-w-0">
                              <SubdirectoryArrowRightIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                              <Typography fontSize={14} noWrap>
                                {child.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {child.path}
                              </Typography>
                              {!child.visible && <VisibilityOffOutlinedIcon sx={{ fontSize: 13, color: "text.disabled" }} />}
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" onClick={() => openEditChild(item._tempId, child)} aria-label={`Edit ${child.label}`}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteChild(item._tempId, child)}
                                aria-label={`Delete ${child.label}`}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </Box>
                        )}
                      />
                    </Box>
                  )}
                </Paper>
              )}
            />
          )}
        </Paper>

        <CtaForm value={cta} onChange={setCta} disabled={saving} />

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} className="mb-3">
            Preview
          </Typography>
          <NavPreview items={localItems} cta={cta} />
        </Paper>
      </Stack>

      <NavItemFormDialog
        open={!!itemDialog}
        isChild={itemDialog?.isChild}
        initialValues={itemDialog?.initialValues}
        onClose={() => setItemDialog(null)}
        onSave={handleSaveItemDialog}
      />
    </>
  );
}
