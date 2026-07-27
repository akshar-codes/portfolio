import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
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
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LaunchIcon from "@mui/icons-material/Launch";

import PageHeader from "../../components/common/PageHeader";
import DragReorderList from "../../components/common/DragReorderList";
import { TextField as RHFTextField, SwitchField, RichTextField } from "../../components/form/fields";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  useAdminFooterQuery,
  useUpdateFooter,
  usePublishFooter,
  useUnpublishFooter,
} from "../../hooks/useFooter";
import {
  footerColumnFormSchema,
  footerColumnFormDefaults,
  footerLinkFormSchema,
  footerLinkFormDefaults,
} from "../../schemas/footerSchema";

const MAX_COLUMNS = 6;
const MAX_LINKS_PER_COLUMN = 15;

/* ── Helpers ─────────────────────────────────────────────────────── */

function withTempIds(columns = []) {
  return columns.map((col) => ({
    ...col,
    _tempId: col._id ?? crypto.randomUUID(),
    links: (col.links ?? []).map((link) => ({ ...link, _tempId: link._id ?? crypto.randomUUID() })),
  }));
}

function stripForCompare(columns = []) {
  return columns.map(({ title, links }) => ({
    title,
    links: (links ?? []).map((l) => ({ label: l.label, url: l.url })),
  }));
}

function stripForSubmit(columns = []) {
  return columns.map((col, order) => ({
    ...(col._id ? { _id: col._id } : {}),
    title: col.title,
    order,
    links: (col.links ?? []).map((link) => ({
      ...(link._id ? { _id: link._id } : {}),
      label: link.label,
      url: link.url,
    })),
  }));
}

/* ── Column / Link dialogs ───────────────────────────────────────── */

function ColumnFormDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(footerColumnFormSchema), defaultValues: footerColumnFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? footerColumnFormDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((v) => {
            onSave(v);
            onClose();
          })}
          noValidate
        >
          <DialogTitle fontWeight={700}>Footer column</DialogTitle>
          <DialogContent dividers>
            <RHFTextField name="title" label="Column title" required maxLength={60} />
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

function LinkFormDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(footerLinkFormSchema), defaultValues: footerLinkFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? footerLinkFormDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((v) => {
            onSave(v);
            onClose();
          })}
          noValidate
        >
          <DialogTitle fontWeight={700}>Footer link</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="label" label="Label" required maxLength={50} />
              <RHFTextField name="url" label="URL" required maxLength={2048} placeholder="/services or https://…" />
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

/* ── General settings form ──────────────────────────────────────── */

const generalFormSchema = z.object({
  description: z.string().max(1000, "Description must not exceed 1000 characters"),
  copyrightText: z.string().trim().max(300, "Copyright text must not exceed 300 characters"),
  showSocialLinks: z.boolean(),
  showContactInfo: z.boolean(),
});

function GeneralSettingsForm({ footer, onSave, saving }) {
  const form = useForm({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      description: footer.description ?? "",
      copyrightText: footer.copyrightText ?? "",
      showSocialLinks: footer.showSocialLinks ?? true,
      showContactInfo: footer.showContactInfo ?? true,
    },
  });

  return (
    <FormProvider {...form}>
      <Box component="form" onSubmit={form.handleSubmit(onSave)} noValidate>
        <Stack spacing={3}>
          <RichTextField name="description" label="Footer description" maxLength={1000} />
          <RHFTextField name="copyrightText" label="Copyright text" maxLength={300} />
          <SwitchField name="showSocialLinks" label="Show social links (managed under Profile)" />
          <SwitchField name="showContactInfo" label="Show contact information (managed under Site Settings)" />
          <Box>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving…" : "Save general settings"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </FormProvider>
  );
}

/* ── Newsletter form ─────────────────────────────────────────────── */

const newsletterFormSchema = z.object({
  enabled: z.boolean(),
  heading: z.string().trim().max(100, "Heading must not exceed 100 characters"),
  description: z.string().max(1000, "Description must not exceed 1000 characters"),
  placeholder: z.string().trim().max(100, "Placeholder must not exceed 100 characters"),
  buttonLabel: z.string().trim().max(40, "Button label must not exceed 40 characters"),
});

function NewsletterForm({ footer, onSave, saving }) {
  const nl = footer.newsletter ?? {};
  const form = useForm({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      enabled: nl.enabled ?? false,
      heading: nl.heading ?? "Subscribe to our newsletter",
      description: nl.description ?? "",
      placeholder: nl.placeholder ?? "Enter your email",
      buttonLabel: nl.buttonLabel ?? "Subscribe",
    },
  });

  return (
    <FormProvider {...form}>
      <Box component="form" onSubmit={form.handleSubmit((values) => onSave({ newsletter: values }))} noValidate>
        <Stack spacing={3}>
          <SwitchField name="enabled" label="Enabled" />
          <RHFTextField name="heading" label="Heading" maxLength={100} />
          <RichTextField name="description" label="Description" maxLength={1000} />
          <RHFTextField name="placeholder" label="Email input placeholder" maxLength={100} />
          <RHFTextField name="buttonLabel" label="Button label" maxLength={40} />
          <Box>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? "Saving…" : "Save newsletter settings"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </FormProvider>
  );
}

/* ── Live preview ────────────────────────────────────────────────── */

function FooterPreview({ columns, description, copyrightText, newsletter }) {
  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 3, bgcolor: "background.default" }}>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          className="mb-4 max-w-md"
          component="div"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      )}
      <Box
        className="grid gap-6"
        sx={{ gridTemplateColumns: `repeat(${Math.max(columns.length, 1)}, minmax(120px, 1fr))` }}
      >
        {columns.map((col) => (
          <Box key={col._tempId}>
            <Typography fontWeight={700} fontSize={13} className="mb-2">
              {col.title}
            </Typography>
            <Stack spacing={0.5}>
              {col.links.map((link) => (
                <Typography key={link._tempId} fontSize={12} color="text.secondary">
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Box>
        ))}
      </Box>
      {newsletter.enabled && (
        <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography fontWeight={700} fontSize={13}>
            {newsletter.heading}
          </Typography>
          {newsletter.description && (
            <Typography
              variant="caption"
              color="text.secondary"
              component="div"
              dangerouslySetInnerHTML={{ __html: newsletter.description }}
            />
          )}
          <Chip label={newsletter.buttonLabel} size="small" sx={{ mt: 1 }} />
        </Box>
      )}
      <Typography variant="caption" color="text.disabled" className="block mt-4">
        {copyrightText}
      </Typography>
    </Box>
  );
}

/* ================================================================== *
 * Main ManageFooter component
 * ================================================================== */
export default function ManageFooter() {
  const { data, isLoading, isError, error, refetch } = useAdminFooterQuery();
  const { mutateAsync: updateFooter, isPending: saving } = useUpdateFooter();
  const { mutateAsync: publish, isPending: publishing } = usePublishFooter();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishFooter();
  const confirm = useConfirmDialog();

  const [localColumns, setLocalColumns] = useState(null);
  const [serverColumns, setServerColumns] = useState(null);
  const [columnDialog, setColumnDialog] = useState(null);
  const [linkDialog, setLinkDialog] = useState(null);

  useEffect(() => {
    if (data && localColumns === null) {
      const seeded = withTempIds(
        [...(data.columns ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      setLocalColumns(seeded);
      setServerColumns(seeded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const isDirty = useMemo(() => {
    if (!localColumns || !serverColumns) return false;
    return JSON.stringify(stripForCompare(localColumns)) !== JSON.stringify(stripForCompare(serverColumns));
  }, [localColumns, serverColumns]);

  useEffect(() => {
    const handler = (e) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const openAddColumn = () => setColumnDialog({ mode: "add" });
  const openEditColumn = (col) => setColumnDialog({ mode: "edit", tempId: col._tempId, initialValues: col });
  const openAddLink = (colTempId) => setLinkDialog({ mode: "add", colTempId });
  const openEditLink = (colTempId, link) =>
    setLinkDialog({ mode: "edit", colTempId, tempId: link._tempId, initialValues: link });

  const handleSaveColumn = (values) => {
    setLocalColumns((prev) => {
      if (columnDialog.mode === "add") {
        return [...prev, { _tempId: crypto.randomUUID(), ...values, links: [] }];
      }
      return prev.map((c) => (c._tempId === columnDialog.tempId ? { ...c, ...values } : c));
    });
  };

  const handleDeleteColumn = async (col) => {
    const confirmed = await confirm({
      title: `Delete "${col.title}"?`,
      description: "This action cannot be undone.",
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;
    setLocalColumns((prev) => prev.filter((c) => c._tempId !== col._tempId));
  };

  const handleSaveLink = (values) => {
    setLocalColumns((prev) =>
      prev.map((col) => {
        if (col._tempId !== linkDialog.colTempId) return col;
        if (linkDialog.mode === "add") {
          return { ...col, links: [...col.links, { _tempId: crypto.randomUUID(), ...values }] };
        }
        return { ...col, links: col.links.map((l) => (l._tempId === linkDialog.tempId ? { ...l, ...values } : l)) };
      }),
    );
  };

  const handleDeleteLink = async (colTempId, link) => {
    const confirmed = await confirm({ title: `Delete "${link.label}"?`, confirmLabel: "Delete", tone: "danger" });
    if (!confirmed) return;
    setLocalColumns((prev) =>
      prev.map((c) => (c._tempId === colTempId ? { ...c, links: c.links.filter((l) => l._tempId !== link._tempId) } : c)),
    );
  };

  const handleReorderColumns = (reordered) => setLocalColumns(reordered);
  const handleReorderLinks = (colTempId, reorderedLinks) =>
    setLocalColumns((prev) => prev.map((c) => (c._tempId === colTempId ? { ...c, links: reorderedLinks } : c)));

  const handleSaveColumns = async () => {
    try {
      const updated = await updateFooter({ columns: stripForSubmit(localColumns) });
      const seeded = withTempIds(
        [...(updated.columns ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
      );
      setLocalColumns(seeded);
      setServerColumns(seeded);
      toast.success("Footer columns saved.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDiscardColumns = () => setLocalColumns(serverColumns);

  const handleSaveGeneral = async (values) => {
    try {
      await updateFooter(values);
      toast.success("Footer settings saved.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveNewsletter = async (payload) => {
    try {
      await updateFooter(payload);
      toast.success("Newsletter settings saved.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTogglePublish = async () => {
    try {
      if (data.status === "draft") {
        await publish();
        toast.success("Footer published.");
      } else {
        await unpublish();
        toast.success("Footer unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading || localColumns === null) {
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
        title="Footer"
        subtitle="Manage footer columns, newsletter signup, and copyright text."
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
            Unsaved column changes.
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" color="inherit" onClick={handleDiscardColumns} disabled={saving}>
              Discard
            </Button>
            <Button size="small" variant="contained" onClick={handleSaveColumns} disabled={saving}>
              {saving ? "Saving…" : "Save columns"}
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack spacing={3}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" fontWeight={700}>
              Footer columns
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={openAddColumn} disabled={localColumns.length >= MAX_COLUMNS}>
              Add column
            </Button>
          </Box>

          {localColumns.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-6 text-center">
              No footer columns yet.
            </Typography>
          ) : (
            <DragReorderList
              items={localColumns}
              getId={(c) => c._tempId}
              onReorder={handleReorderColumns}
              renderItem={({ item: col }) => (
                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Box className="flex items-center justify-between gap-2">
                    <Typography fontWeight={600}>{col.title}</Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        size="small"
                        startIcon={<AddIcon fontSize="small" />}
                        onClick={() => openAddLink(col._tempId)}
                        disabled={col.links.length >= MAX_LINKS_PER_COLUMN}
                      >
                        Link
                      </Button>
                      <IconButton size="small" onClick={() => openEditColumn(col)} aria-label={`Edit ${col.title}`}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteColumn(col)} aria-label={`Delete ${col.title}`}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>

                  {col.links.length > 0 && (
                    <Box sx={{ pl: 3, pt: 1.5, mt: 1.5, borderTop: "1px dashed", borderColor: "divider" }}>
                      <DragReorderList
                        items={col.links}
                        getId={(l) => l._tempId}
                        onReorder={(reordered) => handleReorderLinks(col._tempId, reordered)}
                        renderItem={({ item: link }) => (
                          <Box className="flex items-center justify-between gap-2">
                            <Box className="flex items-center gap-1.5 min-w-0">
                              <LaunchIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                              <Typography fontSize={13} noWrap>
                                {link.label}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {link.url}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5}>
                              <IconButton size="small" onClick={() => openEditLink(col._tempId, link)} aria-label={`Edit ${link.label}`}>
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteLink(col._tempId, link)}
                                aria-label={`Delete ${link.label}`}
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

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} className="mb-3">
            General settings
          </Typography>
          <GeneralSettingsForm footer={data} onSave={handleSaveGeneral} saving={saving} />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} className="mb-3">
            Newsletter signup
          </Typography>
          <NewsletterForm footer={data} onSave={handleSaveNewsletter} saving={saving} />
        </Paper>

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} className="mb-3">
            Live preview
          </Typography>
          <FooterPreview
            columns={localColumns}
            description={data.description}
            copyrightText={data.copyrightText}
            newsletter={data.newsletter ?? {}}
          />
        </Paper>
      </Stack>

      <ColumnFormDialog
        open={!!columnDialog}
        initialValues={columnDialog?.initialValues}
        onClose={() => setColumnDialog(null)}
        onSave={handleSaveColumn}
      />
      <LinkFormDialog
        open={!!linkDialog}
        initialValues={linkDialog?.initialValues}
        onClose={() => setLinkDialog(null)}
        onSave={handleSaveLink}
      />
    </>
  );
}
