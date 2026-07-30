import { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import CloseIcon from "@mui/icons-material/Close";

import PageHeader from "../../components/common/PageHeader";
import MediaPickerDialog from "../../components/cms/MediaPickerDialog";
import { SerpPreview, SocialCardPreview } from "../../components/cms/SeoPreview";
import TagInput from "../../components/common/TagInput";
import { TextField as RHFTextField, SwitchField, SelectField } from "../../components/form/fields";
import {
  useAdminSeoQuery,
  useUpdateSeo,
  usePublishSeo,
  useUnpublishSeo,
} from "../../hooks/useSeo";
import { seoFormSchema, seoFormDefaultsFrom } from "../../schemas/seoSchema";

/* ── Character counter helper ────────────────────────────────────── */
function CharCounter({ value = "", max, recommended }) {
  const len = value.length;
  const over = len > max;
  const overRecommended = recommended && len > recommended;
  return (
    <Typography variant="caption" color={over ? "error.main" : overRecommended ? "warning.main" : "text.secondary"}>
      {len} / {max}
      {recommended ? ` (recommended ≤ ${recommended})` : ""}
    </Typography>
  );
}

/* ── Bound "pick from media library" image field ─────────────────── */
function LibraryImageField({ name, control, label }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Box>
          <Typography variant="body2" fontWeight={600} className="mb-1.5">
            {label}
          </Typography>
          <Box className="flex items-center gap-3 flex-wrap">
            <Box
              sx={{
                width: 96,
                height: 54,
                borderRadius: 1.5,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "action.hover",
                overflow: "hidden",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {field.value ? (
                <img src={field.value} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Typography variant="caption" color="text.disabled">
                  No image
                </Typography>
              )}
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PhotoLibraryOutlinedIcon fontSize="small" />}
              onClick={() => setPickerOpen(true)}
            >
              {field.value ? "Replace" : "Choose from library"}
            </Button>
            {field.value && (
              <IconButton size="small" onClick={() => field.onChange("")} aria-label={`Clear ${label}`}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <MediaPickerDialog
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            onSelect={(url) => field.onChange(url)}
            title={`Select ${label.toLowerCase()}`}
          />
        </Box>
      )}
    />
  );
}

const OG_TYPE_OPTIONS = [
  { label: "Website", value: "website" },
  { label: "Article", value: "article" },
  { label: "Profile", value: "profile" },
];

const TWITTER_CARD_OPTIONS = [
  { label: "Summary", value: "summary" },
  { label: "Summary — large image", value: "summary_large_image" },
];

export default function ManageSeo() {
  const { data, isLoading, isError, error, refetch } = useAdminSeoQuery();
  const { mutateAsync: updateSeo, isPending: saving } = useUpdateSeo();
  const { mutateAsync: publish, isPending: publishing } = usePublishSeo();
  const { mutateAsync: unpublish, isPending: unpublishing } = useUnpublishSeo();

  const form = useForm({
    resolver: zodResolver(seoFormSchema),
    defaultValues: seoFormDefaultsFrom(),
  });
  const {
    control,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (data) reset(seoFormDefaultsFrom(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const values = watch();

  const onSubmit = async (formValues) => {
    try {
      const updated = await updateSeo(formValues);
      reset(seoFormDefaultsFrom(updated));
      toast.success("SEO settings saved.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTogglePublish = async () => {
    try {
      if (data.status === "draft") {
        await publish();
        toast.success("SEO settings published.");
      } else {
        await unpublish();
        toast.success("SEO settings unpublished.");
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (isLoading) {
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
  const structuredDataError = errors?.structuredData?.message;

  return (
    <>
      <PageHeader
        title="SEO"
        subtitle="Global search-engine and social-sharing defaults, used when a page doesn't override them."
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

      <FormProvider {...form}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box className="grid gap-6" sx={{ gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, alignItems: "start" }}>
            <Stack spacing={3}>
              {/* Global meta */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Global meta tags
                </Typography>
                <Stack spacing={2.5}>
                  <Box>
                    <RHFTextField name="defaultMetaTitle" label="Default meta title" required maxLength={70} />
                    <Box className="flex justify-end mt-0.5">
                      <CharCounter value={values.defaultMetaTitle} max={70} recommended={60} />
                    </Box>
                  </Box>
                  <Box>
                    <RHFTextField
                      name="defaultMetaDescription"
                      label="Default meta description"
                      multiline
                      rows={3}
                      maxLength={160}
                    />
                    <Box className="flex justify-end mt-0.5">
                      <CharCounter value={values.defaultMetaDescription} max={160} />
                    </Box>
                  </Box>
                  <Controller
                    name="defaultKeywords"
                    control={control}
                    render={({ field }) => (
                      <TagInput
                        id="seo-keywords"
                        label="Default keywords"
                        placeholder="e.g. full stack developer (press Enter)"
                        items={field.value}
                        onChange={field.onChange}
                        maxItems={20}
                      />
                    )}
                  />
                  <RHFTextField
                    name="canonicalBaseUrl"
                    label="Canonical base URL"
                    maxLength={2048}
                    placeholder="https://your-portfolio-domain.com"
                  />
                </Stack>
              </Paper>

              {/* OpenGraph */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  OpenGraph (Facebook, LinkedIn, WhatsApp)
                </Typography>
                <Stack spacing={2.5}>
                  <Box>
                    <RHFTextField name="openGraph.title" label="OG title" maxLength={70} placeholder="Falls back to default meta title" />
                    <Box className="flex justify-end mt-0.5">
                      <CharCounter value={values.openGraph?.title} max={70} />
                    </Box>
                  </Box>
                  <Box>
                    <RHFTextField
                      name="openGraph.description"
                      label="OG description"
                      multiline
                      rows={2}
                      maxLength={200}
                      placeholder="Falls back to default meta description"
                    />
                    <Box className="flex justify-end mt-0.5">
                      <CharCounter value={values.openGraph?.description} max={200} />
                    </Box>
                  </Box>
                  <LibraryImageField name="openGraph.image" control={control} label="OG image (1200×630 recommended)" />
                  <SelectField name="openGraph.type" label="OG type" options={OG_TYPE_OPTIONS} />
                </Stack>
              </Paper>

              {/* Twitter Card */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Twitter card
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="twitterHandle" label="Twitter/X handle" maxLength={16} placeholder="@yourhandle" />
                  <SelectField name="twitterCard.cardType" label="Card type" options={TWITTER_CARD_OPTIONS} />
                  <Box>
                    <RHFTextField name="twitterCard.title" label="Card title" maxLength={70} placeholder="Falls back to OG title" />
                    <Box className="flex justify-end mt-0.5">
                      <CharCounter value={values.twitterCard?.title} max={70} />
                    </Box>
                  </Box>
                  <Box>
                    <RHFTextField
                      name="twitterCard.description"
                      label="Card description"
                      multiline
                      rows={2}
                      maxLength={200}
                      placeholder="Falls back to OG description"
                    />
                    <Box className="flex justify-end mt-0.5">
                      <CharCounter value={values.twitterCard?.description} max={200} />
                    </Box>
                  </Box>
                  <LibraryImageField name="twitterCard.image" control={control} label="Card image" />
                </Stack>
              </Paper>

              {/* Robots & sitemap */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Robots &amp; sitemap
                </Typography>
                <Stack spacing={1}>
                  <SwitchField name="robotsIndex" label="Allow search engines to index this site" />
                  <SwitchField name="robotsFollow" label="Allow search engines to follow links" />
                  <SwitchField name="sitemapEnabled" label="Generate sitemap.xml" />
                </Stack>
              </Paper>

              {/* Verification & analytics */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Verification &amp; analytics
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="googleSiteVerification" label="Google Search Console verification token" maxLength={100} />
                  <RHFTextField name="bingSiteVerification" label="Bing Webmaster verification token" maxLength={100} />
                  <RHFTextField name="googleAnalyticsId" label="Google Analytics ID" maxLength={40} placeholder="G-XXXXXXXXXX" />
                </Stack>
              </Paper>

              {/* Organization */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Organization (JSON-LD)
                </Typography>
                <Stack spacing={2.5}>
                  <RHFTextField name="organization.name" label="Organization name" maxLength={150} />
                  <RHFTextField name="organization.url" label="Organization URL" maxLength={2048} />
                  <LibraryImageField name="organization.logoUrl" control={control} label="Organization logo" />
                </Stack>
              </Paper>

              {/* Structured data */}
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Custom structured data (JSON-LD)
                </Typography>
                {structuredDataError && (
                  <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                    {structuredDataError}
                  </Alert>
                )}
                <RHFTextField
                  name="structuredData"
                  label="Raw JSON-LD"
                  multiline
                  rows={6}
                  placeholder='{"@context":"https://schema.org", "@type":"Person", ...}'
                />
              </Paper>

              <Box>
                <Button type="submit" variant="contained" size="large" disabled={saving}>
                  {saving ? "Saving…" : "Save SEO settings"}
                </Button>
              </Box>
            </Stack>

            {/* Live preview column */}
            <Box sx={{ position: { lg: "sticky" }, top: { lg: 24 } }}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Google search preview
                </Typography>
                <SerpPreview title={values.defaultMetaTitle} description={values.defaultMetaDescription} url={values.canonicalBaseUrl} />
              </Paper>

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} className="mb-3">
                  Social share preview
                </Typography>
                <SocialCardPreview
                  title={values.openGraph?.title || values.defaultMetaTitle}
                  description={values.openGraph?.description || values.defaultMetaDescription}
                  image={values.openGraph?.image || values.defaultOgImage}
                  siteName={values.canonicalBaseUrl}
                />
              </Paper>
            </Box>
          </Box>
        </Box>
      </FormProvider>
    </>
  );
}
