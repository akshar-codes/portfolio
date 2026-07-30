import { z } from "zod";

export const seoFormSchema = z.object({
  defaultMetaTitle: z
    .string()
    .trim()
    .min(2, "Default meta title must be at least 2 characters")
    .max(70, "Default meta title must not exceed 70 characters"),
  defaultMetaDescription: z.string().trim().max(160).optional(),
  defaultKeywords: z.array(z.string().trim()).max(20).optional(),
  defaultOgImage: z.string().trim().optional(),
  twitterHandle: z
    .string()
    .trim()
    .max(16)
    .regex(/^@[A-Za-z0-9_]{1,15}$/, "Invalid Twitter handle")
    .optional()
    .or(z.literal("")),
  canonicalBaseUrl: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  robotsIndex: z.boolean().optional(),
  robotsFollow: z.boolean().optional(),
  sitemapEnabled: z.boolean().optional(),
  googleAnalyticsId: z.string().trim().max(40).optional(),
  googleSiteVerification: z.string().trim().max(100).optional(),
  bingSiteVerification: z.string().trim().max(100).optional(),
  openGraph: z.object({
    title: z.string().trim().max(70).optional(),
    description: z.string().trim().max(200).optional(),
    image: z.string().trim().optional(),
    type: z.enum(["website", "article", "profile"]).optional(),
  }).optional(),
  twitterCard: z.object({
    cardType: z.enum(["summary", "summary_large_image"]).optional(),
    title: z.string().trim().max(70).optional(),
    description: z.string().trim().max(200).optional(),
    image: z.string().trim().optional(),
  }).optional(),
  structuredData: z.string().trim().max(5000).optional(),
  organization: z.object({
    name: z.string().trim().max(150).optional(),
    url: z.string().trim().optional(),
    logoUrl: z.string().trim().optional(),
  }).optional()
});

export function seoFormDefaultsFrom(data = {}) {
  return {
    defaultMetaTitle: data.defaultMetaTitle || "",
    defaultMetaDescription: data.defaultMetaDescription || "",
    defaultKeywords: data.defaultKeywords || [],
    defaultOgImage: data.defaultOgImage || "",
    twitterHandle: data.twitterHandle || "",
    canonicalBaseUrl: data.canonicalBaseUrl || "",
    robotsIndex: data.robotsIndex ?? true,
    robotsFollow: data.robotsFollow ?? true,
    sitemapEnabled: data.sitemapEnabled ?? true,
    googleAnalyticsId: data.googleAnalyticsId || "",
    googleSiteVerification: data.googleSiteVerification || "",
    bingSiteVerification: data.bingSiteVerification || "",
    openGraph: {
      title: data.openGraph?.title || "",
      description: data.openGraph?.description || "",
      image: data.openGraph?.image || "",
      type: data.openGraph?.type || "website",
    },
    twitterCard: {
      cardType: data.twitterCard?.cardType || "summary",
      title: data.twitterCard?.title || "",
      description: data.twitterCard?.description || "",
      image: data.twitterCard?.image || "",
    },
    structuredData: data.structuredData || "",
    organization: {
      name: data.organization?.name || "",
      url: data.organization?.url || "",
      logoUrl: data.organization?.logoUrl || "",
    }
  };
}
