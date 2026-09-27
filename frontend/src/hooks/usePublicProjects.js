import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import { portfolioSnapshotApi } from "../api/portfolioSnapshotApi";

const LIST_STALE_TIME = 60_000;

/** Paginated, filterable, searchable public project listing. */
export function usePublicProjectsQuery(params, options = {}) {
  const preview = params?.preview || false;
  return useQuery({
    queryKey: ["projects", "public", "list", params ?? {}],
    queryFn: async () => {
      if (preview) return api.get(API_ENDPOINTS.adminProjects, { params }).then((res) => res.data);
      const snapshot = await portfolioSnapshotApi.load();
      const search = String(params?.search ?? "").trim().toLowerCase();
      const category = String(params?.category ?? "");
      const featured = String(params?.featured ?? "");
      const matches = snapshot.projects.filter((project) => {
        const categoryMatch = !category || String(project.category?._id ?? project.category) === category || String(project.category?.slug ?? "") === category;
        const textMatch = !search || `${project.title ?? ""} ${project.description ?? ""}`.toLowerCase().includes(search);
        const featuredMatch = !featured || String(Boolean(project.featured)) === featured;
        return categoryMatch && textMatch && featuredMatch;
      });
      const page = Math.max(1, Number(params?.page) || 1);
      const limit = Math.max(1, Number(params?.limit) || 9);
      return { projects: matches.slice((page - 1) * limit, page * limit), total: matches.length, page, limit, totalPages: Math.ceil(matches.length / limit) };
    },
    // Keeps the previous page's rows on screen while a new page/filter
    // loads, instead of flashing an empty grid on every keystroke/click.
    placeholderData: (previousData) => previousData,
    staleTime: preview ? 0 : LIST_STALE_TIME,
    ...options,
  });
}

/** Single project — backs the details modal. */
export function usePublicProjectQuery(id, { preview = false, ...options } = {}) {
  return useQuery({
    queryKey: ["projects", preview ? "preview" : "public", "item", id],
    queryFn: async () => {
      if (preview) return api.get(API_ENDPOINTS.adminProjectById(id)).then((res) => res.data);
      const snapshot = await portfolioSnapshotApi.load();
      const project = snapshot.projects.find((item) => item._id === id || item.slug === id);
      if (!project) throw Object.assign(new Error("Project not found."), { statusCode: 404 });
      return project;
    },
    enabled: Boolean(id),
    staleTime: preview ? 0 : LIST_STALE_TIME,
    ...options,
  });
}
