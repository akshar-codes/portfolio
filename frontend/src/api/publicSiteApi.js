import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Public (unauthenticated) reads for the site-wide CMS singletons that
 * back the Navbar, Footer, and document <head>. Distinct from
 * navigationApi.js / footerApi.js / siteSettingsApi.js / seoApi.js,
 * which are the admin-authenticated read/write surfaces for the same
 * resources — those hit /admin/* and return every status; these hit
 * the public routes, which 404 (CONTENT_NOT_PUBLISHED) while the
 * resource is in "draft".
 */
export const publicSiteApi = {
  getNavigation: () => api.get(API_ENDPOINTS.navigation).then((res) => res.data),
  getFooter: () => api.get(API_ENDPOINTS.footer).then((res) => res.data),
  getSiteSettings: () => api.get(API_ENDPOINTS.siteSettings).then((res) => res.data),
  getSeo: () => api.get(API_ENDPOINTS.seo).then((res) => res.data),
};
