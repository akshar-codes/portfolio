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
import Alert from "@mui/material/Alert";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import PageHeader from "../../components/common/PageHeader";
import LoadingSkeleton from "../../components/common/LoadingSkeleton";
import DragReorderList from "../../components/cms/DragReorderList";
import LibraryImageField from "../../components/LibraryImageField";
import { TextField as RHFTextField, RichTextField } from "../../components/form/fields";
import { resolveIcon } from "../../utils/iconMap";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";
import {
  useAdminProfileQuery,
  useUpdateProfile,
  usePublishProfile,
  useUnpublishProfile,
} from "../../hooks/useProfile";
import {
  profileBasicInfoSchema,
  profileBasicInfoDefaults,
  socialLinkFormSchema,
  socialLinkFormDefaults,
  ctaButtonFormSchema,
  ctaButtonFormDefaults,
  CTA_BUTTON_STYLE_OPTIONS,
  statisticFormSchema,
  statisticFormDefaults,
} from "../../schemas/profileSchema";

const MAX_SOCIAL_LINKS = 10;
const MAX_CTA_BUTTONS = 3;
const MAX_STATISTICS = 8;

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
 * Basic Info form
 * ================================================================== */
function BasicInfoSection({ profile, onSave, saving }) {
  const form = useForm({
    resolver: zodResolver(profileBasicInfoSchema),
    defaultValues: profileBasicInfoDefaults,
  });

  useEffect(() => {
    form.reset({
      name: profile.name ?? "",
      title: profile.title ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
      location: profile.location ?? "",
      avatar: profile.avatar ?? "",
      introduction: profile.introduction ?? "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Hero identity
      </Typography>
      <FormProvider {...form}>
        <Box component="form" onSubmit={form.handleSubmit(onSave)} noValidate>
          <Stack spacing={2.5}>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField name="name" label="Name" required maxLength={100} />
              <RHFTextField name="title" label="Title / role" required maxLength={100} />
            </Box>
            <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RHFTextField name="email" label="Email" required maxLength={254} />
              <RHFTextField name="phone" label="Phone" maxLength={30} />
            </Box>
            <RHFTextField name="location" label="Location" maxLength={120} />

            <Controller
              name="avatar"
              control={form.control}
              render={({ field, fieldState }) => (
                <LibraryImageField
                  label="Avatar"
                  shape="circle"
                  value={field.value}
                  onChange={field.onChange}
                  error={fieldState.error?.message}
                  hint="Displayed as the hero profile photo."
                />
              )}
            />

            <RichTextField name="introduction" label="Short introduction" maxLength={2000} />

            <Box>
              <Button type="submit" variant="contained" disabled={saving}>
                {saving ? "Saving…" : "Save hero identity"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </FormProvider>
    </Paper>
  );
}

/* ================================================================== *
 * Social link dialog
 * ================================================================== */
function SocialLinkDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({
    resolver: zodResolver(socialLinkFormSchema),
    defaultValues: socialLinkFormDefaults,
  });

  useEffect(() => {
    if (open) form.reset(initialValues ?? socialLinkFormDefaults);
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
          <DialogTitle fontWeight={700}>Social link</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="label" label="Label" required maxLength={50} />
              <RHFTextField
                name="url"
                label="URL"
                required
                maxLength={2048}
                placeholder="https://linkedin.com/in/…"
              />
              <RHFTextField
                name="icon"
                label="Icon key"
                required
                maxLength={40}
                placeholder="linkedin, github, leetcode, x, email…"
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
 * CTA button dialog
 * ================================================================== */
function CtaButtonDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({
    resolver: zodResolver(ctaButtonFormSchema),
    defaultValues: ctaButtonFormDefaults,
  });

  useEffect(() => {
    if (open) form.reset(initialValues ?? ctaButtonFormDefaults);
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
          <DialogTitle fontWeight={700}>CTA button</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <RHFTextField name="label" label="Label" required maxLength={40} />
              <RHFTextField
                name="url"
                label="URL"
                required
                maxLength={2048}
                placeholder="/contact or https://…"
              />
              <Box className="flex items-center gap-2">
                {CTA_BUTTON_STYLE_OPTIONS.map((opt) => (
                  <Controller
                    key={opt.value}
                    name="style"
                    control={form.control}
                    render={({ field }) => (
                      <Chip
                        label={opt.label}
                        onClick={() => field.onChange(opt.value)}
                        color={field.value === opt.value ? "primary" : "default"}
                        variant={field.value === opt.value ? "filled" : "outlined"}
                      />
                    )}
                  />
                ))}
              </Box>
              <Controller
                name="openInNewTab"
                control={form.control}
                render={({ field }) => (
                  <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                    <Typography variant="body2">Open in a new tab</Typography>
                  </label>
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
 * Statistic dialog
 * ================================================================== */
function StatisticDialog({ open, initialValues, onClose, onSave }) {
  const form = useForm({
    resolver: zodResolver(statisticFormSchema),
    defaultValues: statisticFormDefaults,
  });

  useEffect(() => {
    if (open) form.reset(initialValues ?? statisticFormDefaults);
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
          <DialogTitle fontWeight={700}>Statistic</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 0.5 }}>
              <Box className="grid grid-cols-2 gap-3">
                <RHFTextField name="value" label="Value" type="number" required />
                <RHFTextField name="suffix" label="Suffix" maxLength={10} placeholder="+" />
              </Box>
              <RHFTextField
                name="label"
                label="Label"
                required
                maxLength={60}
                placeholder="Years of experience"
              />
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
 * Hero preview
 * ================================================================== */
function HeroPreview({ profile, socialLinks, ctaButtons, statistics }) {
  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, bgcolor: "background.default" }}>
      <Typography variant="subtitle1" fontWeight={700} className="mb-3">
        Hero preview
      </Typography>

      <Box className="flex items-center gap-4 mb-3">
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            overflow: "hidden",
            bgcolor: "action.hover",
            flexShrink: 0,
          }}
        >
          {profile.avatar && (
            <img src={profile.avatar} alt={profile.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {profile.name || "Your Name"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.title || "Your title"}
          </Typography>
        </Box>
      </Box>

      {profile.introduction && (
        <Typography
          variant="body2"
          color="text.secondary"
          className="mb-3 max-w-xl"
          component="div"
          dangerouslySetInnerHTML={{ __html: profile.introduction }}
        />
      )}

      {ctaButtons.length > 0 && (
        <Stack direction="row" spacing={1} className="mb-4" flexWrap="wrap">
          {ctaButtons.map((btn) => (
            <Chip
              key={btn._tempId}
              label={btn.label}
              color={btn.style === "primary" ? "primary" : "default"}
              variant={btn.style === "outline" ? "outlined" : "filled"}
            />
          ))}
        </Stack>
      )}

      {statistics.length > 0 && (
        <Box className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 pt-3" sx={{ borderTop: "1px solid", borderColor: "divider" }}>
          {statistics.map((s) => (
            <Box key={s._tempId}>
              <Typography variant="h6" fontWeight={800}>
                {s.value}
                {s.suffix}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {socialLinks.length > 0 && (
        <Stack direction="row" spacing={1}>
          {socialLinks.map((link) => {
            const Icon = resolveIcon(link.icon);
            return (
              <Box
                key={link._tempId}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={16} />
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}

/* ================================================================== *
 * Main ManageProfile component
 * ================================================================== */
export default function ManageProfile() {
  const { data, isLoading, isError, error, refetch } = useAdminProfileQuery();
  const { mutateAsync: updateProfile, isPending: savingBasic } = useUpdateProfile();
  const { mutateAsync: publish, isPending: publishing } = usePublishProfile();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishProfile();
  const confirm = useConfirmDialog();

  const [localLinks, setLocalLinks] = useState(null);
  const [serverLinks, setServerLinks] = useState(null);
  const [localCtas, setLocalCtas] = useState(null);
  const [serverCtas, setServerCtas] = useState(null);
  const [localStats, setLocalStats] = useState(null);
  const [serverStats, setServerStats] = useState(null);

  const [linkDialog, setLinkDialog] = useState(null);
  const [ctaDialog, setCtaDialog] = useState(null);
  const [statDialog, setStatDialog] = useState(null);

  const [savingLinks, setSavingLinks] = useState(false);
  const [savingCtas, setSavingCtas] = useState(false);
  const [savingStats, setSavingStats] = useState(false);

  useEffect(() => {
    if (!data) return;
    if (localLinks === null) {
      const seeded = withTempIds(data.socialLinks);
      setLocalLinks(seeded);
      setServerLinks(seeded);
    }
    if (localCtas === null) {
      const seeded = withTempIds(data.ctaButtons);
      setLocalCtas(seeded);
      setServerCtas(seeded);
    }
    if (localStats === null) {
      const seeded = withTempIds(data.statistics);
      setLocalStats(seeded);
      setServerStats(seeded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const linksDirty = useMemo(() => {
    if (!localLinks || !serverLinks) return false;
    return (
      JSON.stringify(stripForCompare(localLinks, ["label", "url", "icon"])) !==
      JSON.stringify(stripForCompare(serverLinks, ["label", "url", "icon"]))
    );
  }, [localLinks, serverLinks]);

  const ctasDirty = useMemo(() => {
    if (!localCtas || !serverCtas) return false;
    return (
      JSON.stringify(stripForCompare(localCtas, ["label", "url", "style", "openInNewTab"])) !==
      JSON.stringify(stripForCompare(serverCtas, ["label", "url", "style", "openInNewTab"]))
    );
  }, [localCtas, serverCtas]);

  const statsDirty = useMemo(() => {
    if (!localStats || !serverStats) return false;
    return (
      JSON.stringify(stripForCompare(localStats, ["value", "suffix", "label", "icon"])) !==
      JSON.stringify(stripForCompare(serverStats, ["value", "suffix", "label", "icon"]))
    );
  }, [localStats, serverStats]);

  const anyDirty = linksDirty || ctasDirty || statsDirty;

  useEffect(() => {
    const handler = (e) => {
      if (!anyDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [anyDirty]);

  /* ── Basic info save ─────────────────────────────────────────── */
  const handleSaveBasic = async (values) => {
    try {
      await updateProfile(values);
      toast.success("Hero identity updated.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  /* ── Social links ────────────────────────────────────────────── */
  const handleSaveLinkDialog = (values) => {
    setLocalLinks((prev) => {
      if (linkDialog.mode === "add") {
        return [...prev, { _tempId: crypto.randomUUID(), ...values }];
      }
      return prev.map((l) => (l._tempId === linkDialog.tempId ? { ...l, ...values } : l));
    });
  };

  const handleDeleteLink = async (link) => {
    const confirmed = await confirm({
      title: `Delete "${link.label}"?`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;
    setLocalLinks((prev) => prev.filter((l) => l._tempId !== link._tempId));
  };

  const handleSaveLinksOrder = async () => {
    setSavingLinks(true);
    try {
      const updated = await updateProfile({ socialLinks: stripForSubmit(localLinks, ["label", "url", "icon"]) });
      const seeded = withTempIds(updated.socialLinks);
      setLocalLinks(seeded);
      setServerLinks(seeded);
      toast.success("Social links saved.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingLinks(false);
    }
  };

  /* ── CTA buttons ─────────────────────────────────────────────── */
  const handleSaveCtaDialog = (values) => {
    setLocalCtas((prev) => {
      if (ctaDialog.mode === "add") {
        return [...prev, { _tempId: crypto.randomUUID(), ...values }];
      }
      return prev.map((c) => (c._tempId === ctaDialog.tempId ? { ...c, ...values } : c));
    });
  };

  const handleDeleteCta = async (cta) => {
    const confirmed = await confirm({
      title: `Delete "${cta.label}"?`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;
    setLocalCtas((prev) => prev.filter((c) => c._tempId !== cta._tempId));
  };

  const handleSaveCtasOrder = async () => {
    setSavingCtas(true);
    try {
      const updated = await updateProfile({
        ctaButtons: stripForSubmit(localCtas, ["label", "url", "style", "openInNewTab"]),
      });
      const seeded = withTempIds(updated.ctaButtons);
      setLocalCtas(seeded);
      setServerCtas(seeded);
      toast.success("CTA buttons saved.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingCtas(false);
    }
  };

  /* ── Statistics ──────────────────────────────────────────────── */
  const handleSaveStatDialog = (values) => {
    setLocalStats((prev) => {
      if (statDialog.mode === "add") {
        return [...prev, { _tempId: crypto.randomUUID(), ...values }];
      }
      return prev.map((s) => (s._tempId === statDialog.tempId ? { ...s, ...values } : s));
    });
  };

  const handleDeleteStat = async (stat) => {
    const confirmed = await confirm({
      title: `Delete "${stat.label}"?`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;
    setLocalStats((prev) => prev.filter((s) => s._tempId !== stat._tempId));
  };

  const handleSaveStatsOrder = async () => {
    setSavingStats(true);
    try {
      const updated = await updateProfile({
        statistics: stripForSubmit(localStats, ["value", "suffix", "label", "icon"]),
      });
      const seeded = withTempIds(updated.statistics);
      setLocalStats(seeded);
      setServerStats(seeded);
      toast.success("Statistics saved.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingStats(false);
    }
  };

  /* ── Publish toggle ──────────────────────────────────────────── */
  const handleTogglePublish = async () => {
    try {
      if (data.status === "draft") {
        await publish();
        toast.success("Profile published.");
      } else {
        await unpublish();
        toast.success("Profile unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading || localLinks === null || localCtas === null || localStats === null) {
    return (
      <>
        <PageHeader title="Profile" subtitle="Hero identity, CTA buttons, statistics, and social links." />
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
        title="Profile"
        subtitle="Hero identity, CTA buttons, statistics, and social links shown on the public homepage."
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

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        The downloadable CV link is managed under <strong>Site Settings → Resume</strong>, not here — this
        avoids maintaining two copies of the same download URL.
      </Alert>

      <Stack spacing={3}>
        <BasicInfoSection profile={data} onSave={handleSaveBasic} saving={savingBasic} />

        {/* ── Social links ─────────────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" fontWeight={700}>
              Social links
            </Typography>
            <Stack direction="row" spacing={1}>
              {linksDirty && (
                <Button size="small" variant="contained" onClick={handleSaveLinksOrder} disabled={savingLinks}>
                  {savingLinks ? "Saving…" : "Save changes"}
                </Button>
              )}
              <Button
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setLinkDialog({ mode: "add" })}
                disabled={localLinks.length >= MAX_SOCIAL_LINKS}
              >
                Add link
              </Button>
            </Stack>
          </Box>

          {localLinks.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-6 text-center">
              No social links yet.
            </Typography>
          ) : (
            <DragReorderList
              items={localLinks}
              getId={(item) => item._tempId}
              onReorder={setLocalLinks}
              renderItem={({ item }) => {
                const Icon = resolveIcon(item.icon);
                return (
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
                    <Box className="flex items-center justify-between gap-2">
                      <Box className="flex items-center gap-2 min-w-0">
                        <Icon size={18} />
                        <Typography fontWeight={600} noWrap>
                          {item.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {item.url}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        <IconButton
                          size="small"
                          onClick={() => setLinkDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                          aria-label={`Edit ${item.label}`}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteLink(item)} aria-label={`Delete ${item.label}`}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Box>
                  </Paper>
                );
              }}
            />
          )}
        </Paper>

        {/* ── CTA buttons ──────────────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" fontWeight={700}>
              CTA buttons
            </Typography>
            <Stack direction="row" spacing={1}>
              {ctasDirty && (
                <Button size="small" variant="contained" onClick={handleSaveCtasOrder} disabled={savingCtas}>
                  {savingCtas ? "Saving…" : "Save changes"}
                </Button>
              )}
              <Button
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setCtaDialog({ mode: "add" })}
                disabled={localCtas.length >= MAX_CTA_BUTTONS}
              >
                Add button
              </Button>
            </Stack>
          </Box>

          {localCtas.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-6 text-center">
              No CTA buttons yet — up to {MAX_CTA_BUTTONS}.
            </Typography>
          ) : (
            <DragReorderList
              items={localCtas}
              getId={(item) => item._tempId}
              onReorder={setLocalCtas}
              renderItem={({ item }) => (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
                  <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2 min-w-0">
                      <Chip size="small" label={item.style} />
                      <Typography fontWeight={600} noWrap>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {item.url}
                      </Typography>
                      {item.openInNewTab && <OpenInNewIcon sx={{ fontSize: 14, color: "text.disabled" }} />}
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => setCtaDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                        aria-label={`Edit ${item.label}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteCta(item)} aria-label={`Delete ${item.label}`}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Paper>
              )}
            />
          )}
        </Paper>

        {/* ── Statistics ───────────────────────────────────────── */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
          <Box className="flex items-center justify-between mb-3">
            <Typography variant="subtitle1" fontWeight={700}>
              Statistics
            </Typography>
            <Stack direction="row" spacing={1}>
              {statsDirty && (
                <Button size="small" variant="contained" onClick={handleSaveStatsOrder} disabled={savingStats}>
                  {savingStats ? "Saving…" : "Save changes"}
                </Button>
              )}
              <Button
                size="small"
                startIcon={<AddIcon fontSize="small" />}
                onClick={() => setStatDialog({ mode: "add" })}
                disabled={localStats.length >= MAX_STATISTICS}
              >
                Add statistic
              </Button>
            </Stack>
          </Box>

          {localStats.length === 0 ? (
            <Typography variant="body2" color="text.secondary" className="py-6 text-center">
              No statistics yet.
            </Typography>
          ) : (
            <DragReorderList
              items={localStats}
              getId={(item) => item._tempId}
              onReorder={setLocalStats}
              renderItem={({ item }) => (
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, width: "100%" }}>
                  <Box className="flex items-center justify-between gap-2">
                    <Box className="flex items-center gap-2 min-w-0">
                      <Typography fontWeight={700}>
                        {item.value}
                        {item.suffix}
                      </Typography>
                      <Typography color="text.secondary" noWrap>
                        {item.label}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton
                        size="small"
                        onClick={() => setStatDialog({ mode: "edit", tempId: item._tempId, initialValues: item })}
                        aria-label={`Edit ${item.label}`}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteStat(item)} aria-label={`Delete ${item.label}`}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Paper>
              )}
            />
          )}
        </Paper>

        <HeroPreview profile={data} socialLinks={localLinks} ctaButtons={localCtas} statistics={localStats} />
      </Stack>

      <SocialLinkDialog
        open={!!linkDialog}
        initialValues={linkDialog?.initialValues}
        onClose={() => setLinkDialog(null)}
        onSave={handleSaveLinkDialog}
      />
      <CtaButtonDialog
        open={!!ctaDialog}
        initialValues={ctaDialog?.initialValues}
        onClose={() => setCtaDialog(null)}
        onSave={handleSaveCtaDialog}
      />
      <StatisticDialog
        open={!!statDialog}
        initialValues={statDialog?.initialValues}
        onClose={() => setStatDialog(null)}
        onSave={handleSaveStatDialog}
      />
    </>
  );
}
