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
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import DragReorderList from "../../components/cms/DragReorderList";
import LibraryImageField from "../../components/LibraryImageField";
import TagInput from "../../components/common/TagInput";
import {
  TextField as RHFTextField,
  SelectField,
  SwitchField,
  RichTextField,
} from "../../components/form/fields";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  useAdminResumeQuery,
  useUpdateResume,
  usePublishResume,
  useUnpublishResume,
} from "../../hooks/useResume";
import {
  AVAILABILITY_STATUS_OPTIONS,
  heroFormSchema,
  heroFormDefaults,
  aboutMeFormSchema,
  aboutMeFormDefaults,
  experienceFormSchema,
  experienceFormDefaults,
  educationFormSchema,
  educationFormDefaults,
  certificationFormSchema,
  certificationFormDefaults,
  skillGroupFormSchema,
  skillGroupFormDefaults,
  LANGUAGE_PROFICIENCY_OPTIONS,
  languageFormSchema,
  languageFormDefaults,
  interestFormSchema,
  interestFormDefaults,
  DOWNLOAD_FILE_TYPE_OPTIONS,
  downloadFormSchema,
  downloadFormDefaults,
} from "../../schemas/resumeSchema";

const MAX_EXPERIENCE = 30;
const MAX_EDUCATION = 20;
const MAX_CERTIFICATIONS = 30;
const MAX_SKILLS = 15;
const MAX_LANGUAGES = 15;
const MAX_INTERESTS = 20;
const MAX_DOWNLOADS = 5;

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
 * Hero form
 * ================================================================== */
function HeroSection({ resume, onSave, saving }) {
  const form = useForm({ resolver: zodResolver(heroFormSchema), defaultValues: heroFormDefaults });

  useEffect(() => {
    form.reset({
      greeting: resume.hero?.greeting ?? "Hello, I'm",
      headline: resume.hero?.headline ?? "",
      summary: resume.hero?.summary ?? "",
      availabilityStatus: resume.hero?.availabilityStatus ?? "available",
      ctaLabel: resume.hero?.ctaLabel ?? "Download CV",
      ctaEnabled: resume.hero?.ctaEnabled ?? true,
      heroImage: resume.hero?.heroImage ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.hero]);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Hero
      </Typography>
      <FormProvider {...form}>
        <Box component="form" onSubmit={form.handleSubmit((v) => onSave({ hero: v }))} noValidate>
          <Stack spacing={2.5}>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField name="greeting" label="Greeting" maxLength={60} />
              <RHFTextField name="headline" label="Headline" maxLength={100} />
            </Box>
            <RichTextField name="summary" label="Hero summary" maxLength={300} />
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField name="availabilityStatus" label="Availability" options={AVAILABILITY_STATUS_OPTIONS} />
              <RHFTextField name="ctaLabel" label="CTA button label" maxLength={40} />
            </Box>
            <SwitchField name="ctaEnabled" label="Show the download-CV button" />
            <Controller
              name="heroImage"
              control={form.control}
              render={({ field, fieldState }) => (
                <LibraryImageField
                  label="Hero image"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  hint="Optional — a resume-page-specific image, distinct from the profile avatar."
                />
              )}
            />
            <Box>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving…" : "Save hero"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </FormProvider>
    </Paper>
  );
}

/* ================================================================== *
 * About Me form
 * ================================================================== */
function AboutMeSection({ resume, onSave, saving }) {
  const form = useForm({ resolver: zodResolver(aboutMeFormSchema), defaultValues: aboutMeFormDefaults });

  useEffect(() => {
    form.reset({ summary: resume.aboutMe?.summary ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume.aboutMe]);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        About me
      </Typography>
      <FormProvider {...form}>
        <Box component="form" onSubmit={form.handleSubmit((v) => onSave({ aboutMe: v }))} noValidate>
          <Stack spacing={2.5}>
            <RichTextField name="summary" label="Summary" maxLength={4000} />
            <Box>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving…" : "Save about me"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </FormProvider>
    </Paper>
  );
}

/* ================================================================== *
 * Dialogs
 * ================================================================== */
function ExperienceDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(experienceFormSchema), defaultValues: experienceFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? experienceFormDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const current = form.watch("current");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((v) => {
            onSave({ ...v, endDate: v.current ? "" : v.endDate });
            onClose();
          })}
          noValidate
        >
          <DialogTitle fontWeight={700}>Experience</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="role" label="Role / Title" required maxLength={100} />
              <RHFTextField name="company" label="Company" required maxLength={150} />
              <RHFTextField name="location" label="Location" maxLength={120} />
              <Box className="grid grid-cols-2 gap-3">
                <RHFTextField name="startDate" label="Start date" required maxLength={40} placeholder="Jan 2025" />
                <RHFTextField name="endDate" label="End date" maxLength={40} placeholder="Jun 2025" disabled={current} />
              </Box>
              <SwitchField name="current" label="I currently work here" />
              <RichTextField name="description" label="Description" maxLength={3000} />
              <Controller
                name="companyLogo"
                control={form.control}
                render={({ field, fieldState }) => (
                  <LibraryImageField label="Company logo (optional)" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
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

function EducationDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(educationFormSchema), defaultValues: educationFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? educationFormDefaults);
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
          <DialogTitle fontWeight={700}>Education</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="institution" label="Institution" required maxLength={200} />
              <RHFTextField name="duration" label="Duration" required maxLength={80} placeholder="2025 — 2029" />
              <RHFTextField name="description" label="Description" required multiline rows={3} maxLength={1000} />
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

function CertificationDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(certificationFormSchema), defaultValues: certificationFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? certificationFormDefaults);
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
          <DialogTitle fontWeight={700}>Certification</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="title" label="Title" required maxLength={150} />
              <RHFTextField name="issuer" label="Issuer" required maxLength={150} />
              <RHFTextField name="issueDate" label="Issue date" maxLength={40} placeholder="2024" />
              <RHFTextField name="credentialUrl" label="Credential URL" maxLength={2048} />
              <Controller
                name="badgeImage"
                control={form.control}
                render={({ field, fieldState }) => (
                  <LibraryImageField label="Badge image (optional)" value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
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

function SkillGroupDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(skillGroupFormSchema), defaultValues: skillGroupFormDefaults });
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      form.reset(initialValues ? { category: initialValues.category } : skillGroupFormDefaults);
      setItems(initialValues?.items ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <FormProvider {...form}>
        <Box
          component="form"
          onSubmit={form.handleSubmit((v) => {
            onSave({ ...v, items });
            onClose();
          })}
          noValidate
        >
          <DialogTitle fontWeight={700}>Skill category</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="category" label="Category name" required maxLength={80} placeholder="Frontend" />
              <TagInput
                id="resume-skill-items"
                label="Skills in this category"
                placeholder="e.g. React (press Enter)"
                items={items}
                onChange={setItems}
                maxItems={30}
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

function LanguageDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(languageFormSchema), defaultValues: languageFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? languageFormDefaults);
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
          <DialogTitle fontWeight={700}>Language</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="name" label="Language" required maxLength={60} />
              <SelectField name="proficiency" label="Proficiency" options={LANGUAGE_PROFICIENCY_OPTIONS} />
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

function InterestDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(interestFormSchema), defaultValues: interestFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? interestFormDefaults);
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
          <DialogTitle fontWeight={700}>Interest</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="name" label="Name" required maxLength={60} />
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

function DownloadDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({ resolver: zodResolver(downloadFormSchema), defaultValues: downloadFormDefaults });

  useEffect(() => {
    if (open) form.reset(initialValues ?? downloadFormDefaults);
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
          <DialogTitle fontWeight={700}>Download file</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="label" label="Label" required maxLength={80} placeholder="Resume (PDF)" />
              <RHFTextField
                name="url"
                label="File URL"
                required
                placeholder="https://res.cloudinary.com/…/resume.pdf"
              />
              <SelectField name="fileType" label="File type" options={DOWNLOAD_FILE_TYPE_OPTIONS} />
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
 * Ordered-list section shell — shared by Experience / Education /
 * Certifications / Skills / Languages / Interests / Downloads.
 * ================================================================== */
function OrderedListSection({
  title,
  items,
  setItems,
  serverItems,
  compareFields,
  maxItems,
  saving,
  onAdd,
  onSaveOrder,
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
            <Button size="small" variant="contained" onClick={onSaveOrder} disabled={saving}>
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
function ResumePreview({ resume, experience, skills }) {
  const hero = resume.hero ?? {};

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "background.default" }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Resume preview
      </Typography>

      <Box className="flex items-center gap-4 mb-3">
        {hero.heroImage && (
          <Box sx={{ width: 56, height: 56, borderRadius: 2, overflow: "hidden", flexShrink: 0 }}>
            <img src={hero.heroImage} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </Box>
        )}
        <Box>
          <Typography variant="caption" color="text.secondary">
            {hero.greeting}
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {hero.headline || "Your headline"}
          </Typography>
        </Box>
        {hero.ctaEnabled && <Chip label={hero.ctaLabel || "Download CV"} color="primary" size="small" className="ml-auto" />}
      </Box>

      {hero.summary && (
        <Typography
          variant="body2"
          color="text.secondary"
          className="mb-4"
          component="div"
          dangerouslySetInnerHTML={{ __html: hero.summary }}
        />
      )}

      {resume.aboutMe?.summary && (
        <Box className="mb-4">
          <Typography variant="subtitle2" fontWeight={700} className="mb-1">
            About me
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            dangerouslySetInnerHTML={{ __html: resume.aboutMe.summary }}
          />
        </Box>
      )}

      {experience.length > 0 && (
        <Box className="mb-4">
          <Typography variant="subtitle2" fontWeight={700} className="mb-2">
            Experience
          </Typography>
          <Stack spacing={1}>
            {experience.slice(0, 3).map((e) => (
              <Box key={e._tempId} className="flex items-center gap-2">
                <Typography fontWeight={600} fontSize={14}>
                  {e.role}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {e.company} · {e.startDate} — {e.current ? "Present" : e.endDate}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {skills.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight={700} className="mb-2">
            Skills
          </Typography>
          <Stack spacing={1}>
            {skills.map((group) => (
              <Box key={group._tempId}>
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  {group.category}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" className="mt-0.5">
                  {group.items.map((i) => (
                    <Chip key={i} label={i} size="small" />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
}

function RowShell({ title, subtitle, logo, onEdit, onDelete }) {
  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
      <Box className="flex items-center justify-between gap-2">
        <Box className="flex items-center gap-2 min-w-0">
          {logo && (
            <Box sx={{ width: 32, height: 32, borderRadius: 1, overflow: "hidden", flexShrink: 0, border: "1px solid", borderColor: "divider" }}>
              <img src={logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          )}
          <Box className="min-w-0">
            <Typography fontWeight={600} noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onEdit} aria-label={`Edit ${title}`}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error" onClick={onDelete} aria-label={`Delete ${title}`}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
    </Paper>
  );
}

/* ================================================================== *
 * Main ManageResume component
 * ================================================================== */
export default function ManageResume() {
  const { data, isLoading, isError, error, refetch } = useAdminResumeQuery();
  const { mutateAsync: updateResume, isPending: savingScalar } = useUpdateResume();
  const { mutateAsync: publish, isPending: publishing } = usePublishResume();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishResume();
  const confirm = useConfirmDialog();

  const sections = [
    { key: "experience", max: MAX_EXPERIENCE, fields: ["role", "company", "location", "startDate", "endDate", "current", "description", "companyLogo"] },
    { key: "education", max: MAX_EDUCATION, fields: ["institution", "duration", "description"] },
    { key: "certifications", max: MAX_CERTIFICATIONS, fields: ["title", "issuer", "issueDate", "credentialUrl", "badgeImage"] },
    { key: "skills", max: MAX_SKILLS, fields: ["category", "items"] },
    { key: "languages", max: MAX_LANGUAGES, fields: ["name", "proficiency"] },
    { key: "interests", max: MAX_INTERESTS, fields: ["name", "icon"] },
    { key: "downloads", max: MAX_DOWNLOADS, fields: ["label", "url", "fileType"] },
  ];

  const [local, setLocal] = useState({});
  const [server, setServer] = useState({});
  const [saving, setSaving] = useState({});
  const [dialogs, setDialogs] = useState({});

  useEffect(() => {
    if (!data) return;
    setLocal((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const { key } of sections) {
        if (next[key] === undefined) {
          next[key] = withTempIds(data[key]);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    setServer((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const { key } of sections) {
        if (next[key] === undefined) {
          next[key] = withTempIds(data[key]);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const ready = data && sections.every(({ key }) => local[key] !== undefined);

  const anyDirty = useMemo(() => {
    if (!ready) return false;
    return sections.some(({ key, fields }) => {
      return (
        JSON.stringify(stripForCompare(local[key], fields)) !==
        JSON.stringify(stripForCompare(server[key], fields))
      );
    });
  }, [ready, local, server]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = (e) => {
      if (!anyDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [anyDirty]);

  const saveSection = async (key, fields) => {
    setSaving((prev) => ({ ...prev, [key]: true }));
    try {
      const payload = { [key]: stripForSubmit(local[key], fields) };
      const updated = await updateResume(payload);
      const seeded = withTempIds(updated[key]);
      setLocal((prev) => ({ ...prev, [key]: seeded }));
      setServer((prev) => ({ ...prev, [key]: seeded }));
      toast.success(`${key[0].toUpperCase()}${key.slice(1)} saved.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const addOrUpdate = (key, dialogState, values) => {
    setLocal((prev) => ({
      ...prev,
      [key]:
        dialogState.mode === "add"
          ? [...prev[key], { _tempId: crypto.randomUUID(), ...values }]
          : prev[key].map((item) => (item._tempId === dialogState.tempId ? { ...item, ...values } : item)),
    }));
  };

  const removeItem = async (key, item, label) => {
    const confirmed = await confirm({ title: `Delete "${label}"?`, confirmLabel: "Delete", tone: "danger" });
    if (!confirmed) return;
    setLocal((prev) => ({ ...prev, [key]: prev[key].filter((i) => i._tempId !== item._tempId) }));
  };

  const handleSaveScalar = async (payload, successMsg) => {
    try {
      await updateResume(payload);
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTogglePublish = async () => {
    try {
      if (data.status === "draft") {
        await publish();
        toast.success("Resume published.");
      } else {
        await unpublish();
        toast.success("Resume unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading || !ready) {
    return (
      <>
        <PageHeader title="Resume" subtitle="Hero, experience, education, certifications, skills, languages, interests, and downloads." />
        <LoadingSkeleton rows={8} />
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
        title="Resume"
        subtitle="Every section of the public résumé page — hero through downloads."
        badge={
          <Chip size="small" variant={isDraft ? "outlined" : "filled"} color={isDraft ? "default" : "success"} label={isDraft ? "Draft" : "Published"} />
        }
        actions={
          <Button variant="outlined" size="small" onClick={handleTogglePublish} disabled={publishing || unpublishing}>
            {publishing || unpublishing ? "…" : isDraft ? "Publish" : "Unpublish"}
          </Button>
        }
      />

      <Stack spacing={3}>
        <HeroSection resume={data} onSave={(p) => handleSaveScalar(p, "Hero updated.")} saving={savingScalar} />
        <AboutMeSection resume={data} onSave={(p) => handleSaveScalar(p, "About me updated.")} saving={savingScalar} />

        <OrderedListSection
          title="Experience"
          items={local.experience}
          setItems={(v) => setLocal((p) => ({ ...p, experience: typeof v === "function" ? v(p.experience) : v }))}
          serverItems={server.experience}
          compareFields={sections[0].fields}
          maxItems={MAX_EXPERIENCE}
          saving={saving.experience}
          emptyLabel="No experience entries yet."
          onAdd={() => setDialogs((p) => ({ ...p, experience: { mode: "add" } }))}
          onSaveOrder={() => saveSection("experience", sections[0].fields)}
          renderRow={({ item }) => (
            <RowShell
              title={item.role}
              subtitle={`${item.company} · ${item.startDate} — ${item.current ? "Present" : item.endDate}`}
              logo={item.companyLogo}
              onEdit={() => setDialogs((p) => ({ ...p, experience: { mode: "edit", tempId: item._tempId, initialValues: item } }))}
              onDelete={() => removeItem("experience", item, item.role)}
            />
          )}
        />

        <OrderedListSection
          title="Education"
          items={local.education}
          setItems={(v) => setLocal((p) => ({ ...p, education: typeof v === "function" ? v(p.education) : v }))}
          serverItems={server.education}
          compareFields={sections[1].fields}
          maxItems={MAX_EDUCATION}
          saving={saving.education}
          emptyLabel="No education entries yet."
          onAdd={() => setDialogs((p) => ({ ...p, education: { mode: "add" } }))}
          onSaveOrder={() => saveSection("education", sections[1].fields)}
          renderRow={({ item }) => (
            <RowShell
              title={item.institution}
              subtitle={item.duration}
              onEdit={() => setDialogs((p) => ({ ...p, education: { mode: "edit", tempId: item._tempId, initialValues: item } }))}
              onDelete={() => removeItem("education", item, item.institution)}
            />
          )}
        />

        <OrderedListSection
          title="Certifications"
          items={local.certifications}
          setItems={(v) => setLocal((p) => ({ ...p, certifications: typeof v === "function" ? v(p.certifications) : v }))}
          serverItems={server.certifications}
          compareFields={sections[2].fields}
          maxItems={MAX_CERTIFICATIONS}
          saving={saving.certifications}
          emptyLabel="No certifications yet."
          onAdd={() => setDialogs((p) => ({ ...p, certifications: { mode: "add" } }))}
          onSaveOrder={() => saveSection("certifications", sections[2].fields)}
          renderRow={({ item }) => (
            <RowShell
              title={item.title}
              subtitle={`${item.issuer}${item.issueDate ? ` · ${item.issueDate}` : ""}`}
              logo={item.badgeImage}
              onEdit={() => setDialogs((p) => ({ ...p, certifications: { mode: "edit", tempId: item._tempId, initialValues: item } }))}
              onDelete={() => removeItem("certifications", item, item.title)}
            />
          )}
        />

        <OrderedListSection
          title="Skills"
          items={local.skills}
          setItems={(v) => setLocal((p) => ({ ...p, skills: typeof v === "function" ? v(p.skills) : v }))}
          serverItems={server.skills}
          compareFields={sections[3].fields}
          maxItems={MAX_SKILLS}
          saving={saving.skills}
          emptyLabel="No skill categories yet."
          onAdd={() => setDialogs((p) => ({ ...p, skills: { mode: "add" } }))}
          onSaveOrder={() => saveSection("skills", sections[3].fields)}
          renderRow={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-center justify-between gap-2">
                <Box className="min-w-0">
                  <Typography fontWeight={600}>{item.category}</Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" className="mt-1">
                    {item.items.map((i) => (
                      <Chip key={i} label={i} size="small" />
                    ))}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => setDialogs((p) => ({ ...p, skills: { mode: "edit", tempId: item._tempId, initialValues: item } }))} aria-label={`Edit ${item.category}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => removeItem("skills", item, item.category)} aria-label={`Delete ${item.category}`}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          )}
        />

        <OrderedListSection
          title="Languages"
          items={local.languages}
          setItems={(v) => setLocal((p) => ({ ...p, languages: typeof v === "function" ? v(p.languages) : v }))}
          serverItems={server.languages}
          compareFields={sections[4].fields}
          maxItems={MAX_LANGUAGES}
          saving={saving.languages}
          emptyLabel="No languages yet."
          onAdd={() => setDialogs((p) => ({ ...p, languages: { mode: "add" } }))}
          onSaveOrder={() => saveSection("languages", sections[4].fields)}
          renderRow={({ item }) => (
            <RowShell
              title={item.name}
              subtitle={item.proficiency}
              onEdit={() => setDialogs((p) => ({ ...p, languages: { mode: "edit", tempId: item._tempId, initialValues: item } }))}
              onDelete={() => removeItem("languages", item, item.name)}
            />
          )}
        />

        <OrderedListSection
          title="Interests"
          items={local.interests}
          setItems={(v) => setLocal((p) => ({ ...p, interests: typeof v === "function" ? v(p.interests) : v }))}
          serverItems={server.interests}
          compareFields={sections[5].fields}
          maxItems={MAX_INTERESTS}
          saving={saving.interests}
          emptyLabel="No interests yet."
          onAdd={() => setDialogs((p) => ({ ...p, interests: { mode: "add" } }))}
          onSaveOrder={() => saveSection("interests", sections[5].fields)}
          renderRow={({ item }) => (
            <RowShell
              title={item.name}
              onEdit={() => setDialogs((p) => ({ ...p, interests: { mode: "edit", tempId: item._tempId, initialValues: item } }))}
              onDelete={() => removeItem("interests", item, item.name)}
            />
          )}
        />

        <OrderedListSection
          title="Downloads"
          items={local.downloads}
          setItems={(v) => setLocal((p) => ({ ...p, downloads: typeof v === "function" ? v(p.downloads) : v }))}
          serverItems={server.downloads}
          compareFields={sections[6].fields}
          maxItems={MAX_DOWNLOADS}
          saving={saving.downloads}
          emptyLabel="No downloadable files yet."
          onAdd={() => setDialogs((p) => ({ ...p, downloads: { mode: "add" } }))}
          onSaveOrder={() => saveSection("downloads", sections[6].fields)}
          renderRow={({ item }) => (
            <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
              <Box className="flex items-center justify-between gap-2">
                <Box className="flex items-center gap-2 min-w-0">
                  <Chip size="small" label={item.fileType} />
                  <Typography fontWeight={600} noWrap>
                    {item.label}
                  </Typography>
                  <OpenInNewIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => setDialogs((p) => ({ ...p, downloads: { mode: "edit", tempId: item._tempId, initialValues: item } }))} aria-label={`Edit ${item.label}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => removeItem("downloads", item, item.label)} aria-label={`Delete ${item.label}`}>
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>
            </Paper>
          )}
        />

        <ResumePreview resume={data} experience={local.experience} skills={local.skills} />
      </Stack>

      <ExperienceDialog
        open={!!dialogs.experience}
        initialValues={dialogs.experience?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, experience: null }))}
        onSave={(v) => addOrUpdate("experience", dialogs.experience, v)}
      />
      <EducationDialog
        open={!!dialogs.education}
        initialValues={dialogs.education?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, education: null }))}
        onSave={(v) => addOrUpdate("education", dialogs.education, v)}
      />
      <CertificationDialog
        open={!!dialogs.certifications}
        initialValues={dialogs.certifications?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, certifications: null }))}
        onSave={(v) => addOrUpdate("certifications", dialogs.certifications, v)}
      />
      <SkillGroupDialog
        open={!!dialogs.skills}
        initialValues={dialogs.skills?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, skills: null }))}
        onSave={(v) => addOrUpdate("skills", dialogs.skills, v)}
      />
      <LanguageDialog
        open={!!dialogs.languages}
        initialValues={dialogs.languages?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, languages: null }))}
        onSave={(v) => addOrUpdate("languages", dialogs.languages, v)}
      />
      <InterestDialog
        open={!!dialogs.interests}
        initialValues={dialogs.interests?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, interests: null }))}
        onSave={(v) => addOrUpdate("interests", dialogs.interests, v)}
      />
      <DownloadDialog
        open={!!dialogs.downloads}
        initialValues={dialogs.downloads?.initialValues}
        onClose={() => setDialogs((p) => ({ ...p, downloads: null }))}
        onSave={(v) => addOrUpdate("downloads", dialogs.downloads, v)}
      />
    </>
  );
}
