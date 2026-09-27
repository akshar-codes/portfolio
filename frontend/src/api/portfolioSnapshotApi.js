import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

const SNAPSHOT_URL = "/generated/portfolio.json";

let snapshotPromise;

async function loadSnapshot() {
  if (!snapshotPromise) {
    snapshotPromise = (import.meta.env.DEV ? loadDevelopmentSnapshot() : fetch(SNAPSHOT_URL).then(async (response) => {
      if (!response.ok) throw new Error(`Portfolio snapshot request failed (${response.status}).`);
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error("Portfolio snapshot is missing. Trigger a production build or start the frontend in development mode.");
      }
      return response.json();
    })).catch((error) => {
      snapshotPromise = undefined;
      throw error;
    });
  }
  return snapshotPromise;
}

async function loadDevelopmentSnapshot() {
  const optionalRead = (endpoint) => api.get(endpoint).then((response) => response.data).catch((error) => {
    if (error.statusCode === 404) return null;
    throw error;
  });

  const [profile, about, resume, categories, navigation, footer, siteSettings, seo, firstPage] = await Promise.all([
    optionalRead(API_ENDPOINTS.profile), optionalRead(API_ENDPOINTS.about), optionalRead(API_ENDPOINTS.resume),
    optionalRead(API_ENDPOINTS.categories), optionalRead(API_ENDPOINTS.navigation), optionalRead(API_ENDPOINTS.footer),
    optionalRead(API_ENDPOINTS.siteSettings), optionalRead(API_ENDPOINTS.seo),
    api.get(API_ENDPOINTS.projects, { params: { page: 1, limit: 50 } }).then((response) => response.data),
  ]);

  const laterPages = await Promise.all(Array.from(
    { length: Math.max(0, (firstPage?.totalPages ?? 1) - 1) },
    (_, index) => api.get(API_ENDPOINTS.projects, { params: { page: index + 2, limit: 50 } }).then((response) => response.data.projects ?? []),
  ));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    profile, about, resume,
    projects: [...(firstPage?.projects ?? []), ...laterPages.flat()],
    categories: categories ?? [], navigation, footer, siteSettings, seo,
  };
}

export const portfolioSnapshotApi = { load: loadSnapshot };
