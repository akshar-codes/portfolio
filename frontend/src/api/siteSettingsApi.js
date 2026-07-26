import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

/**
 * Site Settings is a singleton resource (not a list), so it doesn't fit
 * createResourceApi.js's list/getById/create/update/remove shape. This
 * mirrors that module's spirit (plain, testable, React-Query-free data
 * access) while matching the actual GET/PATCH/publish/unpublish +
 * dedicated logo/favicon upload surface exposed by
 * routes/admin/siteSettingsRoutes.js.
 */
export const siteSettingsApi = {
  get: () => api.get(API_ENDPOINTS.adminSiteSettings).then((res) => res.data),

  update: (payload) =>
    api.patch(API_ENDPOINTS.adminSiteSettings, payload).then((res) => res.data),

  publish: () =>
    api.patch(API_ENDPOINTS.adminSiteSettingsPublish).then((res) => res.data),

  unpublish: () =>
    api.patch(API_ENDPOINTS.adminSiteSettingsUnpublish).then((res) => res.data),

  uploadLogo: (file, onUploadProgress) => {
    const fd = new FormData();
    fd.append("file", file);
    return api
      .patch(API_ENDPOINTS.adminSiteSettingsLogo, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      })
      .then((res) => res.data);
  },

  removeLogo: () =>
    api.delete(API_ENDPOINTS.adminSiteSettingsLogo).then((res) => res.data),

  uploadFavicon: (file, onUploadProgress) => {
    const fd = new FormData();
    fd.append("file", file);
    return api
      .patch(API_ENDPOINTS.adminSiteSettingsFavicon, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      })
      .then((res) => res.data);
  },

  removeFavicon: () =>
    api.delete(API_ENDPOINTS.adminSiteSettingsFavicon).then((res) => res.data),
};
