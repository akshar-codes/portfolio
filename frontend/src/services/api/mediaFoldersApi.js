import api from "../api";
import { API_ENDPOINTS } from "../../constants/apiEndpoints";

export const mediaFoldersApi = {
  list: () => api.get(API_ENDPOINTS.adminMediaFolders).then((res) => res.data),

  create: (name, parentId = null) =>
    api.post(API_ENDPOINTS.adminMediaFolders, { name, parentId }).then((res) => res.data),

  rename: (id, name) =>
    api.patch(API_ENDPOINTS.adminMediaFolderById(id), { name }).then((res) => res.data),

  remove: (id) => api.delete(API_ENDPOINTS.adminMediaFolderById(id)).then((res) => res.data),
};
