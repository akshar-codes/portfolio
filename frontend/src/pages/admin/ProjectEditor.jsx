import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import GitHubIcon from "@mui/icons-material/GitHub";
import LaunchIcon from "@mui/icons-material/Launch";

import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import {
  TextField as RHFTextField,
  SelectField,
  SwitchField,
  RichTextField,
} from "../../components/form/fields";
import LibraryImageField from "../../components/LibraryImageField";
import FilePickerField from "../../components/common/FilePickerField";
import TagInput from "../../components/common/TagInput";
import { GroupedTagInput } from "../../components/common/GroupedTagInput";
import { useCategoriesQuery } from "../../hooks/useCategories";
import {
  useAdminProjectQuery,
  useCreateProject,
  useUpdateProject,
  usePublishProject,
  useUnpublishProject,
} from "../../hooks/useProjects";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { ROUTES } from "../../constants/routes";
import {
  projectFormSchema,
  projectFormDefaults,
  CONTENT_STATUS_OPTIONS,
} from "../../schemas/projectSchema";
import { normaliseTechnologies } from "../../utils/projectHelpers";

const AUTOSAVE_DEBOUNCE_MS = 1500;

/* ================================================================== *
 * AutosaveIndicator
 * ================================================================== */
function AutosaveIndicator({ status }) {
  const config = {
    saving: {
      icon: <SyncOutlinedIcon fontSize="small" />,
      label: "Saving…",
      color: "text.secondary",
    },
    saved: {
      icon: <CloudDoneOutlinedIcon fontSize="small" />,
      label: "All changes saved",
      color: "success.main",
    },
    dirty: {
      icon: <SyncOutlinedIcon fontSize="small" />,
      label: "Unsaved changes — fix validation errors above to autosave",
      color: "warning.main",
    },
    error: {
      icon: <ErrorOutlineIcon fontSize="small" />,
      label: "Autosave failed — your last edits were not saved",
      color: "error.main",
    },
  };

  const entry = config[status];
  if (!entry) return <Box sx={{ height: 28 }} />;

  return (
    <Box className="flex items-center gap-1.5 mb-3" sx={{ color: entry.color }}>
      {entry.icon}
      <Typography variant="caption" sx={{ color: "inherit" }}>
        {entry.label}
      </Typography>
    </Box>
  );
}

/* ================================================================== *
 * GalleryManager — ported from the legacy ManageProjects.jsx, adapted
 * to MUI. Files are kept outside react-hook-form (same convention the
 * rest of this codebase uses for uploads — see AddProject.jsx) since
 * multipart File objects don't round-trip cleanly through Zod/RHF.
 * ================================================================== */
function GalleryManager({ existing, onDeleteExisting, newFiles, onNewFiles }) {
  const handleAdd = (e) => {
    const added = Array.from(e.target.files ?? []);
    const total = existing.length + newFiles.length + added.length;
    if (total > 10) {
      toast.warning("Gallery cannot exceed 10 images.");
      return;
    }
    onNewFiles([...newFiles, ...added]);
    e.target.value = "";
  };

  const removeNew = (idx) => onNewFiles(newFiles.filter((_, i) => i !== idx));

  return (
    <Box>
      {existing.length > 0 && (
        <Box className="flex flex-wrap gap-2 mb-2">
          {existing.map((img) => (
            <Box
              key={img._id}
              sx={{
                position: "relative",
                width: 90,
                height: 62,
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <img src={img.url} alt="Gallery" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
              <Box
                component="button"
                type="button"
                onClick={() => onDeleteExisting(img._id)}
                aria-label="Remove image"
                sx={{
                  position: "absolute",
                  top: 2,
                  right: 2,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  bgcolor: "error.main",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                ×
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {newFiles.length > 0 && (
        <Box className="flex flex-wrap gap-2 mb-2">
          {newFiles.map((f, idx) => {
            const url = URL.createObjectURL(f);
            return (
              <Box
                key={idx}
                sx={{
                  position: "relative",
                  width: 90,
                  height: 62,
                  borderRadius: 1.5,
                  overflow: "hidden",
                  border: "1px dashed",
                  borderColor: "warning.main",
                }}
              >
                <img src={url} alt="New upload" style={{ width: "100%", height: "100%", objectFit: "cover" }} onLoad={() => URL.revokeObjectURL(url)} />
                <Box
                  component="button"
                  type="button"
                  onClick={() => removeNew(idx)}
                  aria-label="Remove image"
                  sx={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                    border: "none",
                    color: "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                >
                  ×
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {existing.length + newFiles.length < 10 && (
        <Button component="label" size="small" variant="outlined">
          Add screenshots ({existing.length + newFiles.length}/10)
          <input type="file" multiple accept="image/*" hidden onChange={handleAdd} />
        </Button>
      )}
    </Box>
  );
}

/* ================================================================== *
 * ProjectPreview — compact live rendering of the current form state,
 * satisfying the "Preview" requirement without duplicating the full
 * public ProjectDetails modal.
 * ================================================================== */
function ProjectPreview({ values, category, imagePreview }) {
  const techGroups = values.technologies ?? [];

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "background.default" }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Live preview
      </Typography>

      {imagePreview && (
        <Box sx={{ borderRadius: 2, overflow: "hidden", mb: 2, aspectRatio: "16 / 9", bgcolor: "action.hover" }}>
          <img src={imagePreview} alt={values.title || "Preview"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </Box>
      )}

      <Box className="flex items-center gap-2 mb-2 flex-wrap">
        <Typography variant="h6" fontWeight={700}>
          {values.title || "Untitled project"}
        </Typography>
        {values.featured && <Chip size="small" color="warning" label="Featured" />}
        <Chip
          size="small"
          variant={values.status === "draft" ? "outlined" : "filled"}
          color={values.status === "draft" ? "default" : "success"}
          label={values.status === "draft" ? "Draft" : "Published"}
        />
      </Box>

      {category && <Chip size="small" label={category.name} sx={{ mb: 2 }} />}

      {values.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          component="div"
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: values.description }}
        />
      )}

      {techGroups.length > 0 && (
        <Stack spacing={1} className="mb-3">
          {techGroups.map((g, i) => (
            <Box key={i}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                {g.group}
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" className="mt-0.5">
                {(g.items ?? []).map((item) => (
                  <Chip key={item} label={item} size="small" />
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      {values.features?.length > 0 && (
        <Box className="mb-3">
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Key features
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" className="mt-1">
            {values.features.map((f) => (
              <Chip key={f} label={f} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}

      {(values.challenge || values.solution) && (
        <Stack spacing={1.5} className="mb-3">
          {values.challenge && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">Challenge</Typography>
              <Typography variant="body2" color="text.secondary" component="div" dangerouslySetInnerHTML={{ __html: values.challenge }} />
            </Box>
          )}
          {values.solution && (
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary">Solution</Typography>
              <Typography variant="body2" color="text.secondary" component="div" dangerouslySetInnerHTML={{ __html: values.solution }} />
            </Box>
          )}
        </Stack>
      )}

      {(values.githubUrl || values.liveUrl) && (
        <Stack direction="row" spacing={1} className="mt-3">
          {values.liveUrl && (
            <Button size="small" variant="contained" startIcon={<LaunchIcon fontSize="small" />} href={values.liveUrl} target="_blank" rel="noopener noreferrer">
              Live
            </Button>
          )}
          {values.githubUrl && (
            <Button size="small" variant="outlined" startIcon={<GitHubIcon fontSize="small" />} href={values.githubUrl} target="_blank" rel="noopener noreferrer">
              Code
            </Button>
          )}
        </Stack>
      )}
    </Paper>
  );
}

/* ================================================================== *
 * Main ProjectEditor component — handles both "create" (/projects/new)
 * and "edit" (/projects/:id/edit) via the presence of a route param.
 * ================================================================== */
export default function ProjectEditor() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const { data: project, isLoading, isError, error, refetch } = useAdminProjectQuery(id, {
    enabled: isEditMode,
  });
  const { data: categories = [] } = useCategoriesQuery();

  const { mutateAsync: createProject, isPending: creating } = useCreateProject();
  const { mutateAsync: updateProject, isPending: updating } = useUpdateProject();
  const { mutateAsync: publishProject } = usePublishProject();
  const { mutateAsync: unpublishProject } = useUnpublishProject();

  const form = useForm({
    resolver: zodResolver(projectFormSchema),
    defaultValues: projectFormDefaults,
    mode: "onBlur",
  });

  // File/gallery state lives outside RHF — matches the existing
  // AddProject.jsx / (legacy) ManageProjects.jsx convention, since
  // File objects don't survive Zod validation or JSON snapshotting
  // (needed for the autosave dirty-check below) cleanly.
  const [thumbnail, setThumbnail] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [existingGallery, setExistingGallery] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [deletedGalleryIds, setDeletedGalleryIds] = useState([]);

  const [autosaveStatus, setAutosaveStatus] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  const lastSavedSnapshotRef = useRef(null);
  // Tracks which project _id the form was last seeded from. Autosave's
  // onSuccess (hooks/useProjects.js useUpdateProject) writes the fresh
  // server response back into the React Query cache, which changes the
  // `project` object *reference* on every successful autosave — without
  // this guard, the seed effect below would re-run and call form.reset()
  // mid-typing, wiping whatever the user had just typed and jumping the
  // cursor in any focused field.
  const seededProjectIdRef = useRef(null);

  // Seed the form (and gallery state) once per project — on initial
  // load, or when navigating to a different project — never on a
  // same-project cache refresh triggered by autosave.
  useEffect(() => {
    if (!isEditMode || !project) return;
    if (seededProjectIdRef.current === project._id) return;

    const seeded = {
      title: project.title ?? "",
      description: project.description ?? "",
      category: project.category?._id ?? "",
      status: project.status ?? "published",
      featured: project.featured ?? false,
      liveUrl: project.liveUrl || project.projectUrl || "",
      githubUrl: project.githubUrl ?? "",
      challenge: project.challenge ?? "",
      solution: project.solution ?? "",
      technologies: normaliseTechnologies(project.technologies ?? []),
      features: [...(project.features ?? [])],
      seo: {
        metaTitle: project.seo?.metaTitle ?? "",
        metaDescription: project.seo?.metaDescription ?? "",
        metaKeywords: project.seo?.metaKeywords ?? [],
        ogImage: project.seo?.ogImage ?? "",
      },
    };
    form.reset(seeded);
    lastSavedSnapshotRef.current = JSON.stringify(seeded);
    seededProjectIdRef.current = project._id;
    setExistingGallery([...(project.gallery ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project, isEditMode]);

  const watchedValues = form.watch();
  const debouncedValues = useDebouncedValue(watchedValues, AUTOSAVE_DEBOUNCE_MS);

  /** Builds the multipart FormData payload the backend project routes expect. */
  const buildFormData = useCallback(
    (values, { includeFiles }) => {
      const fd = new FormData();
      fd.append("title", values.title);
      fd.append("description", values.description);
      fd.append("category", values.category);
      fd.append("status", values.status);
      fd.append("featured", String(values.featured));
      fd.append("liveUrl", values.liveUrl ?? "");
      fd.append("githubUrl", values.githubUrl ?? "");
      fd.append("challenge", values.challenge ?? "");
      fd.append("solution", values.solution ?? "");
      fd.append("technologies", JSON.stringify(values.technologies ?? []));
      fd.append("features", JSON.stringify(values.features ?? []));
      fd.append("seo", JSON.stringify(values.seo ?? {}));

      if (includeFiles) {
        if (thumbnail) fd.append("image", thumbnail);
        if (bannerImage) fd.append("bannerImage", bannerImage);
        newGalleryFiles.forEach((f) => fd.append("gallery", f));
        if (deletedGalleryIds.length > 0) {
          fd.append("deleteGalleryIds", JSON.stringify(deletedGalleryIds));
        }
      }
      return fd;
    },
    [thumbnail, bannerImage, newGalleryFiles, deletedGalleryIds],
  );

  // Autosave — text/array fields only, edit mode only. Files require
  // an explicit "Save" click (see handleManualSave) since silently
  // re-uploading on every keystroke would be wasteful and surprising.
  useEffect(() => {
    if (!isEditMode || !project) return;

    const snapshot = JSON.stringify(debouncedValues);
    if (snapshot === lastSavedSnapshotRef.current) return;

    let cancelled = false;

    (async () => {
      const valid = await form.trigger();
      if (!valid) {
        if (!cancelled) setAutosaveStatus("dirty");
        return;
      }

      setAutosaveStatus("saving");
      try {
        const fd = buildFormData(debouncedValues, { includeFiles: false });
        await updateProject({ id, formData: fd });
        if (!cancelled) {
          lastSavedSnapshotRef.current = snapshot;
          setAutosaveStatus("saved");
        }
      } catch {
        if (!cancelled) setAutosaveStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValues, isEditMode, project]);

  const handleManualSave = form.handleSubmit(async (values) => {
    if (!isEditMode && !thumbnail) {
      toast.error("Please upload a featured (thumbnail) image.");
      return;
    }

    try {
      const fd = buildFormData(values, { includeFiles: true });

      if (isEditMode) {
        const updated = await updateProject({ id, formData: fd });
        lastSavedSnapshotRef.current = JSON.stringify(values);
        setAutosaveStatus("saved");
        setNewGalleryFiles([]);
        setDeletedGalleryIds([]);
        setThumbnail(null);
        setBannerImage(null);
        setExistingGallery(
          [...(updated.gallery ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
        );
        toast.success("Project saved.");
      } else {
        const created = await createProject(fd);
        toast.success("Project created.");
        navigate(`${ROUTES.adminProjects}/${created._id}/edit`, { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    }
  });

  const handleTogglePublish = async () => {
    try {
      if (project.status === "draft") {
        await publishProject(id);
        toast.success("Project published.");
      } else {
        await unpublishProject(id);
        toast.success("Project unpublished.");
      }
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const isDraft = isEditMode ? project?.status === "draft" : watchedValues.status === "draft";
  const selectedCategory = categories.find((c) => c._id === watchedValues.category);

  // Memoized so a blob URL is only (re-)created when the selected File
  // actually changes — not on every render triggered by unrelated form
  // fields (autosave watches every keystroke). Revoked on cleanup/change
  // to avoid leaking blob URLs for the lifetime of the tab.
  const thumbnailPreview = useMemo(() => {
    if (!thumbnail) return project?.image?.url ?? "";
    const url = URL.createObjectURL(thumbnail);
    return url;
  }, [thumbnail, project?.image?.url]);

  useEffect(() => {
    return () => {
      if (thumbnail) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [thumbnail, thumbnailPreview]);

  const bannerPreview = useMemo(() => {
    if (!bannerImage) return project?.bannerImage?.url ?? "";
    const url = URL.createObjectURL(bannerImage);
    return url;
  }, [bannerImage, project?.bannerImage?.url]);

  useEffect(() => {
    return () => {
      if (bannerImage) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerImage, bannerPreview]);

  if (isEditMode && isLoading) {
    return (
      <>
        <PageHeader title="Edit Project" subtitle="Loading project details…" />
        <LoadingSkeleton rows={8} />
      </>
    );
  }

  if (isEditMode && isError) {
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

  return (
    <>
      <PageHeader
        title={isEditMode ? "Edit Project" : "Add Project"}
        subtitle={isEditMode ? project.title : "Publish a new portfolio project."}
        badge={
          isEditMode ? (
            <Chip
              size="small"
              variant={isDraft ? "outlined" : "filled"}
              color={isDraft ? "default" : "success"}
              label={isDraft ? "Draft" : "Published"}
            />
          ) : null
        }
        actions={
          <Stack direction="row" spacing={1}>
            <Button variant="text" startIcon={<ArrowBackIcon />} onClick={() => navigate(ROUTES.adminProjects)}>
              Back
            </Button>
            {isEditMode && (
              <Button variant="outlined" onClick={handleTogglePublish}>
                {isDraft ? "Publish" : "Unpublish"}
              </Button>
            )}
            <Button
              variant={showPreview ? "contained" : "outlined"}
              startIcon={<VisibilityIcon />}
              onClick={() => setShowPreview((p) => !p)}
            >
              Preview
            </Button>
          </Stack>
        }
      />

      {isEditMode && <AutosaveIndicator status={autosaveStatus} />}

      <FormProvider {...form}>
        <Box component="form" onSubmit={handleManualSave} noValidate>
          <Box className="grid gap-6" sx={{ gridTemplateColumns: showPreview ? { xs: "1fr", lg: "1.5fr 1fr" } : "1fr" }}>
            <Stack spacing={3}>
              {/* Basic information */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Basic information
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="title" label="Project title" required maxLength={120} />
                  <RichTextField name="description" label="Description" maxLength={5000} />
                  <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      name="category"
                      label="Category"
                      required
                      options={categories.map((c) => ({ value: c._id, label: c.name }))}
                    />
                    <SelectField name="status" label="Status" options={CONTENT_STATUS_OPTIONS} required />
                  </Box>
                  <SwitchField name="featured" label="Feature this project ahead of the rest of the portfolio grid" />
                </Stack>
              </Paper>

              {/* Links */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Links
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="liveUrl" label="Live demo URL" placeholder="https://your-project.com" />
                  <RHFTextField name="githubUrl" label="GitHub URL" placeholder="https://github.com/you/project" />
                </Stack>
              </Paper>

              {/* Media */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Media
                </Typography>
                <Stack spacing={2.5}>
                  <FilePickerField
                    id="proj-thumbnail"
                    label="Featured image (thumbnail)"
                    required={!isEditMode}
                    file={thumbnail}
                    onChange={(e) => setThumbnail(e.target.files[0] ?? null)}
                    hint={
                      isEditMode
                        ? "Leave blank to keep the current image. Max 5 MB."
                        : "Required. Displayed on portfolio cards. Max 5 MB."
                    }
                  />
                  {thumbnailPreview && (
                    <img src={thumbnailPreview} alt="Thumbnail preview" style={{ width: 160, borderRadius: 8 }} />
                  )}

                  <FilePickerField
                    id="proj-banner"
                    label="Banner image"
                    file={bannerImage}
                    onChange={(e) => setBannerImage(e.target.files[0] ?? null)}
                    hint="Optional large banner shown at the top of the detail view. Max 5 MB."
                  />
                  {bannerPreview && (
                    <img src={bannerPreview} alt="Banner preview" style={{ width: 260, borderRadius: 8 }} />
                  )}
                </Stack>
              </Paper>

              {/* Gallery */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Gallery
                </Typography>
                <GalleryManager
                  existing={existingGallery}
                  onDeleteExisting={(gid) => {
                    setDeletedGalleryIds((prev) => [...prev, gid]);
                    setExistingGallery((prev) => prev.filter((g) => g._id !== gid));
                  }}
                  newFiles={newGalleryFiles}
                  onNewFiles={setNewGalleryFiles}
                />
              </Paper>

              {/* Technologies */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Technologies
                </Typography>
                <Controller
                  name="technologies"
                  control={form.control}
                  render={({ field }) => (
                    <GroupedTagInput id="proj-tech" label="Technology groups" groups={field.value} onChange={field.onChange} />
                  )}
                />
              </Paper>

              {/* Features */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Key features
                </Typography>
                <Controller
                  name="features"
                  control={form.control}
                  render={({ field }) => (
                    <TagInput
                      id="proj-features"
                      label="Features"
                      placeholder="e.g. Authentication, CRUD (press Enter)"
                      items={field.value}
                      onChange={field.onChange}
                      maxItems={20}
                    />
                  )}
                />
              </Paper>

              {/* Challenge / Solution */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Challenge &amp; solution
                </Typography>
                <Stack spacing={2.5}>
                  <RichTextField name="challenge" label="Challenge" maxLength={3000} />
                  <RichTextField name="solution" label="Solution" maxLength={3000} />
                </Stack>
              </Paper>

              {/* SEO */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  SEO
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="seo.metaTitle" label="Meta title" maxLength={70} placeholder="Falls back to the project title" />
                  <RHFTextField
                    name="seo.metaDescription"
                    label="Meta description"
                    multiline
                    rows={2}
                    maxLength={160}
                    placeholder="Falls back to the project description"
                  />
                  <Controller
                    name="seo.metaKeywords"
                    control={form.control}
                    render={({ field }) => (
                      <TagInput
                        id="proj-seo-keywords"
                        label="Meta keywords"
                        placeholder="e.g. react portfolio (press Enter)"
                        items={field.value}
                        onChange={field.onChange}
                        maxItems={20}
                      />
                    )}
                  />
                  <Controller
                    name="seo.ogImage"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <LibraryImageField
                        label="Social share (OG) image"
                        value={field.value}
                        onChange={field.onChange}
                        error={fieldState.error?.message}
                        hint="Shown when this project is shared on social platforms. Picked from the Media Library."
                      />
                    )}
                  />
                </Stack>
              </Paper>

              <Box className="flex justify-end gap-2">
                <Button type="submit" variant="contained" size="large" startIcon={<SaveIcon />} disabled={creating || updating}>
                  {creating || updating ? "Saving…" : isEditMode ? "Save changes" : "Create project"}
                </Button>
              </Box>
            </Stack>

            {showPreview && (
              <Box sx={{ position: { lg: "sticky" }, top: { lg: 24 }, alignSelf: "start" }}>
                <ProjectPreview
                  values={watchedValues}
                  category={selectedCategory}
                  imagePreview={bannerPreview || thumbnailPreview}
                />
              </Box>
            )}
          </Box>
        </Box>
      </FormProvider>
    </>
  );
}
