import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
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
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import DragReorderList from "../../components/cms/DragReorderList";
import ImageGalleryField from "../../components/form/ImageGalleryField";
import TagInput from "../../components/common/TagInput";
import { TextField as RHFTextField, RichTextField } from "../../components/form/fields";
import { ABOUT_ICON_OPTIONS, resolveAboutIcon } from "../../utils/aboutIconMap";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  useAdminAboutQuery,
  useUpdateAbout,
  usePublishAbout,
  useUnpublishAbout,
} from "../../hooks/useAbout";
import {
  serviceFormSchema,
  serviceFormDefaults,
  timelineFormSchema,
  timelineFormDefaults,
  highlightFormSchema,
  highlightFormDefaults,
  personalInfoFormSchema,
  personalInfoFormDefaults,
} from "../../schemas/aboutSchema";

const MAX_SERVICES = 12;
const MAX_TIMELINE = 20;
const MAX_SKILLS_SUMMARY = 20;
const MAX_HIGHLIGHTS = 8;
const MAX_PERSONAL_INFO = 10;
const MAX_IMAGES = 12;

/* ================================================================== *
 * Helpers
 * ================================================================== */

function withTempIds(arr = []) {
  return [...arr]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({ ...item, _tempId: item._id ?? crypto.randomUUID() }));
}

function stripForCompare(arr = [], fields) {
  return arr.map((item) => Object.fromEntries(fields.map((f) => [f, item[f]])));
}

function stripForSubmit(arr = [], fields) {
  return arr.map((item, order) => ({
    ...(item._id ? { _id: item._id } : {}),
    ...Object.fromEntries(fields.map((f) => [f, item[f]])),
    order,
  }));
}

/* ================================================================== *
 * Biography form
 * ================================================================== */
function BiographySection({ about, onSave, saving }) {
  const form = useForm({ defaultValues: { biography: about.biography ?? "" } });

  useEffect(() => {
    form.reset({ biography: about.biography ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [about.biography]);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Biography
      </Typography>
      <FormProvider {...form}>
        <Box component="form" onSubmit={form.handleSubmit(onSave)} noValidate>
          <Stack spacing={2}>
            <RichTextField name="biography" maxLength={8000} />
            <Box>
              <Button type="submit" variant="contained" disabled={saving || !form.formState.isDirty}>
                {saving ? "Saving…" : "Save biography"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </FormProvider>
    </Paper>
  );
}

/* ================================================================== *
 * Skills summary (flat tag list)
 * ================================================================== */
function SkillsSummarySection({ about, onSave, saving }) {
  const [items, setItems] = useState(about.skillsSummary ?? []);

  useEffect(() => {
    setItems(about.skillsSummary ?? []);
  }, [about.skillsSummary]);

  const dirty = JSON.stringify(items) !== JSON.stringify(about.skillsSummary ?? []);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Skills summary
      </Typography>
      <TagInput
        id="skills-summary"
        label="Top skills shown as tags on the About page"
        placeholder="e.g. React (press Enter)"
        items={items}
        onChange={setItems}
        maxItems={MAX_SKILLS_SUMMARY}
      />
      <Box className="mt-2">
        <Button variant="contained" disabled={!dirty || saving} onClick={() => onSave({ skillsSummary: items })}>
          {saving ? "Saving…" : "Save skills summary"}
        </Button>
      </Box>
    </Paper>
  );
}

/* ================================================================== *
 * Service dialog
 * ================================================================== */
function ServiceDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(serviceFormSchema), defaultValues: serviceFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? serviceFormDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((v) => {
            onSave(v);
            onClose();
          })}
          noValidate
        >
          <DialogTitle fontWeight={700}>Service card</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="title" label="Title" required maxLength={100} />
              <RHFTextField name="description" label="Description" required multiline rows={3} maxLength={500} />
              <Controller
                name="icon"
                control={form.control}
                render={({ field }) => (
                  <Box className="flex flex-wrap gap-2">
                    {ABOUT_ICON_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.key}
                        label={opt.label}
                        onClick={() => field.onChange(opt.key)}
                        color={field.value === opt.key ? "primary" : "default"}
                        variant={field.value === opt.key ? "filled" : "outlined"}
                      />
                    ))}
                  </Box>
                )}
              />
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
 * Timeline dialog
 * ================================================================== */
function TimelineDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(timelineFormSchema), defaultValues: timelineFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? timelineFormDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((v) => {
            onSave(v);
            onClose();
          })}
          noValidate
        >
          <DialogTitle fontWeight={700}>Timeline entry</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="title" label="Title" required maxLength={120} />
              <RHFTextField name="subtitle" label="Subtitle" maxLength={150} />
              <RHFTextField name="dateRange" label="Date range" required maxLength={80} placeholder="2021 — 2025" />
              <RHFTextField name="description" label="Description" multiline rows={3} maxLength={1000} />
              <RHFTextField name="icon" label="Icon key (optional)" maxLength={60} />
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
 * Highlight dialog
 * ================================================================== */
function HighlightDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(highlightFormSchema), defaultValues: highlightFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? highlightFormDefaults);
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
          <DialogTitle fontWeight={700}>Highlight</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="value" label="Value" required maxLength={20} placeholder="3+" />
              <RHFTextField name="label" label="Label" required maxLength={60} placeholder="Years of experience" />
              <RHFTextField name="icon" label="Icon key (optional)" maxLength={60} />
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
 * Personal info dialog
 * ================================================================== */
function PersonalInfoDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(personalInfoFormSchema), defaultValues: personalInfoFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? personalInfoFormDefaults);
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
          <DialogTitle fontWeight={700}>Personal info row</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="label" label="Label" required maxLength={40} placeholder="Nationality" />
              <RHFTextField name="value" label="Value" required maxLength={150} placeholder="Indian" />
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
 * Ordered-list section — shared shell for Services / Timeline /
 * Highlights / Personal Info, all of which follow the identical
 * add/edit-dialog + drag-reorder + dirty-banner pattern.
 * ================================================================== */
function OrderedListSection({
  title,
  items,
  setItems,
  serverItems,
  compareFields,
  submitFields,
  maxItems,
  onSaveOrder,
  saving,
  onAdd,
  renderRow,
  emptyLabel,
}) {
  const dirty = useMemo(() => {
    return (
      JSON.stringify(stripForCompare(items, compareFields)) !==
      JSON.stringify(stripForCompare(serverItems, compareFields))
    );
  }, [items, serverItems, compareFields]);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box className="flex items-center justify-between mb-3">
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Stack direction="row" spacing={1}>
          {dirty && (
            <Button
              size="small"
              variant="contained"
              onClick={() => onSaveOrder(stripForSubmit(items, submitFields))}
              disabled={saving}
            >
              {saving ? "Saving…" : "Save changes"}
            </Button>
          )}
          <Button size="small" startIcon={<AddIcon fontSize="small" />} onClick={onAdd} disabled={items.length >= maxItems}>
            Add
          </Button>
        </Stack>
      </Box>

      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary" className="py-6 text-center">
          {emptyLabel}
        </Typography>
      ) : (
        <DragReorderList items={items} getId={(item) => item._tempId} onReorder={setItems} renderItem={renderRow} />
      )}
    </Paper>
  );
}

/* ================================================================== *
 * Preview
 * ================================================================== */
function AboutPreview({ about, skillsSummary, highlights, personalInfo, images }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "background.default" }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        About preview
      </Typography>

      {about.biography && (
        <Typography
          variant="body2"
          color="text.secondary"
          className="mb-3"
          component="div"
          dangerouslySetInnerHTML={{ __html: about.biography }}
        />
      )}

      {skillsSummary.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" className="mb-3">
          {skillsSummary.map((s) => (
            <Chip key={s} label={s} size="small" />
          ))}
        </Stack>
      )}

      {highlights.length > 0 && (
        <Box className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
          {highlights.map((h) => (
            <Box key={h._tempId}>
              <Typography variant="h6" fontWeight={800}>
                {h.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {h.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {personalInfo.length > 0 && (
        <Box className="grid grid-cols-2 gap-2 mb-3">
          {personalInfo.map((p) => (
            <Box key={p._tempId} className="flex gap-1.5">
              <Typography variant="caption" fontWeight={700}>
                {p.label}:
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {p.value}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {images.length > 0 && (
        <Box className="flex gap-2 flex-wrap">
          {images.map((img) => (
            <img
              key={img._tempId}
              src={img.url}
              alt={img.altText || "About"}
              style={{ width: 72, height: 50, objectFit: "cover", borderRadius: 8 }}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
}

/* ================================================================== *
 * Main ManageAbout component
 * ================================================================== */
export default function ManageAbout() {
  const { data, isLoading, isError, error, refetch } = useAdminAboutQuery();
  const { mutateAsync: updateAbout, isPending: savingScalar } = useUpdateAbout();
  const { mutateAsync: publish, isPending: publishing } = usePublishAbout();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishAbout();
  const confirm = useConfirmDialog();

  const [services, setServices] = useState(null);
  const [serverServices, setServerServices] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [serverTimeline, setServerTimeline] = useState(null);
  const [highlights, setHighlights] = useState(null);
  const [serverHighlights, setServerHighlights] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [serverPersonalInfo, setServerPersonalInfo] = useState(null);
  const [images, setImages] = useState(null);

  const [serviceDialog, setServiceDialog] = useState(null);
  const [timelineDialog, setTimelineDialog] = useState(null);
  const [highlightDialog, setHighlightDialog] = useState(null);
  const [personalInfoDialog, setPersonalInfoDialog] = useState(null);

  const [savingServices, setSavingServices] = useState(false);
  const [savingTimeline, setSavingTimeline] = useState(false);
  const [savingHighlights, setSavingHighlights] = useState(false);
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [savingImages, setSavingImages] = useState(false);

  useEffect(() => {
    if (!data) return;
    if (services === null) {
      const seeded = withTempIds(data.services);
      setServices(seeded);
      setServerServices(seeded);
    }
    if (timeline === null) {
      const seeded = withTempIds(data.timeline);
      setTimeline(seeded);
      setServerTimeline(seeded);
    }
    if (highlights === null) {
      const seeded = withTempIds(data.highlights);
      setHighlights(seeded);
      setServerHighlights(seeded);
    }
    if (personalInfo === null) {
      const seeded = withTempIds(data.personalInfo);
      setPersonalInfo(seeded);
      setServerPersonalInfo(seeded);
    }
    if (images === null) {
      setImages(withTempIds(data.images));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const imagesDirty = useMemo(() => {
    if (!images || !data) return false;
    return (
      JSON.stringify(stripForCompare(images, ["url", "altText", "caption"])) !==
      JSON.stringify(stripForCompare(withTempIds(data.images), ["url", "altText", "caption"]))
    );
  }, [images, data]);

  const anyDirty =
    (services && serverServices && JSON.stringify(stripForCompare(services, ["title", "description", "icon"])) !== JSON.stringify(stripForCompare(serverServices, ["title", "description", "icon"]))) ||
    (timeline && serverTimeline && JSON.stringify(stripForCompare(timeline, ["title", "subtitle", "dateRange", "description", "icon"])) !== JSON.stringify(stripForCompare(serverTimeline, ["title", "subtitle", "dateRange", "description", "icon"]))) ||
    (highlights && serverHighlights && JSON.stringify(stripForCompare(highlights, ["value", "label", "icon"])) !== JSON.stringify(stripForCompare(serverHighlights, ["value", "label", "icon"]))) ||
    (personalInfo && serverPersonalInfo && JSON.stringify(stripForCompare(personalInfo, ["label", "value"])) !== JSON.stringify(stripForCompare(serverPersonalInfo, ["label", "value"]))) ||
    imagesDirty;

  useEffect(() => {
    const handler = (e) => {
      if (!anyDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [anyDirty]);

  const genericSave = async (payload, successMsg) => {
    try {
      const updated = await updateAbout(payload);
      toast.success(successMsg);
      return updated;
    } catch (err) {
      toast.error(err.message);
      return null;
    }
  };

  const handleTogglePublish = async () => {
    try {
      if (data.status === "draft") {
        await publish();
        toast.success("About published.");
      } else {
        await unpublish();
        toast.success("About unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSaveImages = async () => {
    setSavingImages(true);
    try {
      const updated = await updateAbout({ images: stripForSubmit(images, ["url", "altText", "caption"]) });
      setImages(withTempIds(updated.images));
      toast.success("Images saved.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingImages(false);
    }
  };

  if (
    isLoading ||
    services === null ||
    timeline === null ||
    highlights === null ||
    personalInfo === null ||
    images === null
  ) {
    return (
      <>
        <PageHeader title="About" subtitle="Biography, timeline, highlights, services, and personal info." />
        <LoadingSkeleton rows={6} />
      </>
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
        title="About"
        subtitle="Biography, timeline, highlights, services, personal info, and gallery images for the public About page."
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

      <Stack spacing={3}>
        <BiographySection about={data} onSave={(p) => genericSave(p, "Biography updated.")} saving={savingScalar} />

        <SkillsSummarySection about={data} onSave={(p) => genericSave(p, "Skills summary updated.")} saving={savingScalar} />

        <OrderedListSection
          title="Services"
          items={services}
          setItems={setServices}
          serverItems={serverServices}
          compareFields={["title", "description", "icon"]}
          submitFields={["title", "description", "icon"]}
          maxItems={MAX_SERVICES}
          saving={savingServices}
          emptyLabel="No service cards yet."
          onAdd={() => setServiceDialog({ mode: "add" })}
          onSaveOrder={async (payload) => {
            setSavingServices(true);
            try {
              const updated = await updateAbout({ services: payload });
              const seeded = withTempIds(updated.services);
              setServices(seeded);
              setServerServices(seeded);
              toast.success("Services saved.");
            } catch (err) {
              toast.error(err.message);
            } finally {
              setSavingServices(false);
            }
          }}
          renderRow={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-center justify-between gap-2">
                <Box className="flex items-center gap-2 min-w-0">
                  <img src={resolveAboutIcon(item.icon)} alt={item.title} width={28} height={28} />
                  <Box className="min-w-0">
                    <Typography fontWeight={600} noWrap>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {item.description}
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setServiceDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                    aria-label={`Edit ${item.title}`}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      const confirmed = await confirm({ title: `Delete "${item.title}"?`, confirmLabel: "Delete", tone: "danger" });
                      if (confirmed) setServices((prev) => prev.filter((s) => s._tempId !== item._tempId));
                    }}
                    aria-label={`Delete ${item.title}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          )}
        />

        <OrderedListSection
          title="Timeline"
          items={timeline}
          setItems={setTimeline}
          serverItems={serverTimeline}
          compareFields={["title", "subtitle", "dateRange", "description", "icon"]}
          submitFields={["title", "subtitle", "dateRange", "description", "icon"]}
          maxItems={MAX_TIMELINE}
          saving={savingTimeline}
          emptyLabel="No timeline entries yet."
          onAdd={() => setTimelineDialog({ mode: "add" })}
          onSaveOrder={async (payload) => {
            setSavingTimeline(true);
            try {
              const updated = await updateAbout({ timeline: payload });
              const seeded = withTempIds(updated.timeline);
              setTimeline(seeded);
              setServerTimeline(seeded);
              toast.success("Timeline saved.");
            } catch (err) {
              toast.error(err.message);
            } finally {
              setSavingTimeline(false);
            }
          }}
          renderRow={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-center justify-between gap-2">
                <Box className="min-w-0">
                  <Typography fontWeight={600} noWrap>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {item.dateRange} {item.subtitle && `· ${item.subtitle}`}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setTimelineDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                    aria-label={`Edit ${item.title}`}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      const confirmed = await confirm({ title: `Delete "${item.title}"?`, confirmLabel: "Delete", tone: "danger" });
                      if (confirmed) setTimeline((prev) => prev.filter((t) => t._tempId !== item._tempId));
                    }}
                    aria-label={`Delete ${item.title}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          )}
        />

        <OrderedListSection
          title="Highlights"
          items={highlights}
          setItems={setHighlights}
          serverItems={serverHighlights}
          compareFields={["value", "label", "icon"]}
          submitFields={["value", "label", "icon"]}
          maxItems={MAX_HIGHLIGHTS}
          saving={savingHighlights}
          emptyLabel="No highlights yet."
          onAdd={() => setHighlightDialog({ mode: "add" })}
          onSaveOrder={async (payload) => {
            setSavingHighlights(true);
            try {
              const updated = await updateAbout({ highlights: payload });
              const seeded = withTempIds(updated.highlights);
              setHighlights(seeded);
              setServerHighlights(seeded);
              toast.success("Highlights saved.");
            } catch (err) {
              toast.error(err.message);
            } finally {
              setSavingHighlights(false);
            }
          }}
          renderRow={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-center justify-between gap-2">
                <Box className="flex items-center gap-2 min-w-0">
                  <Typography fontWeight={800}>{item.value}</Typography>
                  <Typography color="text.secondary" noWrap>
                    {item.label}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setHighlightDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                    aria-label={`Edit ${item.label}`}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      const confirmed = await confirm({ title: `Delete "${item.label}"?`, confirmLabel: "Delete", tone: "danger" });
                      if (confirmed) setHighlights((prev) => prev.filter((h) => h._tempId !== item._tempId));
                    }}
                    aria-label={`Delete ${item.label}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          )}
        />

        <OrderedListSection
          title="Personal info"
          items={personalInfo}
          setItems={setPersonalInfo}
          serverItems={serverPersonalInfo}
          compareFields={["label", "value"]}
          submitFields={["label", "value"]}
          maxItems={MAX_PERSONAL_INFO}
          saving={savingPersonalInfo}
          emptyLabel="No personal info rows yet."
          onAdd={() => setPersonalInfoDialog({ mode: "add" })}
          onSaveOrder={async (payload) => {
            setSavingPersonalInfo(true);
            try {
              const updated = await updateAbout({ personalInfo: payload });
              const seeded = withTempIds(updated.personalInfo);
              setPersonalInfo(seeded);
              setServerPersonalInfo(seeded);
              toast.success("Personal info saved.");
            } catch (err) {
              toast.error(err.message);
            } finally {
              setSavingPersonalInfo(false);
            }
          }}
          renderRow={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-center justify-between gap-2">
                <Box className="flex items-center gap-1.5 min-w-0">
                  <Typography fontWeight={700}>{item.label}:</Typography>
                  <Typography color="text.secondary" noWrap>
                    {item.value}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => setPersonalInfoDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                    aria-label={`Edit ${item.label}`}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      const confirmed = await confirm({ title: `Delete "${item.label}"?`, confirmLabel: "Delete", tone: "danger" });
                      if (confirmed) setPersonalInfo((prev) => prev.filter((p) => p._tempId !== item._tempId));
                    }}
                    aria-label={`Delete ${item.label}`}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          )}
        />

        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" fontWeight={700}>
              Images
            </Typography>
            {imagesDirty && (
              <Button size="small" variant="contained" onClick={handleSaveImages} disabled={savingImages}>
                {savingImages ? "Saving…" : "Save changes"}
              </Button>
            )}
          </Box>
          <ImageGalleryField items={images} onChange={setImages} maxItems={MAX_IMAGES} label="" />
        </Paper>

        <AboutPreview about={data} skillsSummary={data.skillsSummary ?? []} highlights={highlights} personalInfo={personalInfo} images={images} />
      </Stack>

      <ServiceDialog
        open={!!serviceDialog}
        initialValues={serviceDialog?.initialValues}
        onClose={() => setServiceDialog(null)}
        onSave={(values) =>
          setServices((prev) =>
            serviceDialog.mode === "add"
              ? [...prev, { _tempId: crypto.randomUUID(), ...values }]
              : prev.map((s) => (s._tempId === serviceDialog.tempId ? { ...s, ...values } : s)),
          )
        }
      />
      <TimelineDialog
        open={!!timelineDialog}
        initialValues={timelineDialog?.initialValues}
        onClose={() => setTimelineDialog(null)}
        onSave={(values) =>
          setTimeline((prev) =>
            timelineDialog.mode === "add"
              ? [...prev, { _tempId: crypto.randomUUID(), ...values }]
              : prev.map((t) => (t._tempId === timelineDialog.tempId ? { ...t, ...values } : t)),
          )
        }
      />
      <HighlightDialog
        open={!!highlightDialog}
        initialValues={highlightDialog?.initialValues}
        onClose={() => setHighlightDialog(null)}
        onSave={(values) =>
          setHighlights((prev) =>
            highlightDialog.mode === "add"
              ? [...prev, { _tempId: crypto.randomUUID(), ...values }]
              : prev.map((h) => (h._tempId === highlightDialog.tempId ? { ...h, ...values } : h)),
          )
        }
      />
      <PersonalInfoDialog
        open={!!personalInfoDialog}
        initialValues={personalInfoDialog?.initialValues}
        onClose={() => setPersonalInfoDialog(null)}
        onSave={(values) =>
          setPersonalInfo((prev) =>
            personalInfoDialog.mode === "add"
              ? [...prev, { _tempId: crypto.randomUUID(), ...values }]
              : prev.map((p) => (p._tempId === personalInfoDialog.tempId ? { ...p, ...values } : p)),
          )
        }
      />
    </>
  );
}
