import {
  fetchSeoAdmin,
  fetchSeoPublic,
  patchSeo,
  setSeoStatus,
} from "../services/seoService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchAdmin: fetchSeoAdmin,
  fetchPublic: fetchSeoPublic,
  patchSingleton: patchSeo,
  setStatus: setSeoStatus,
};

const {
  getPublicResource: getPublicSeo,
  getAdminResource: getAdminSeo,
  updateResource: updateSeo,
  publishResource: publishSeo,
  unpublishResource: unpublishSeo,
} = createSingletonController({ service, resourceName: "SEO settings" });

export { getPublicSeo, getAdminSeo, updateSeo, publishSeo, unpublishSeo };
