import {
  fetchSeoAdmin,
  fetchSeoPublic,
  patchSeo,
  publishSeo,
  unpublishSeo,
  archiveSeo,
  restoreSeo,
  scheduleSeo,
} from "../services/seo.service.js";
import { createSingletonController } from "./singletonController.js";

const service = {
  fetchAdmin: fetchSeoAdmin,
  fetchPublic: fetchSeoPublic,
  patchSingleton: patchSeo,
  publish: publishSeo,
  unpublish: unpublishSeo,
  archive: archiveSeo,
  restore: restoreSeo,
  schedule: scheduleSeo,
};

const {
  getPublicResource: getPublicSeo,
  getAdminResource: getAdminSeo,
  updateResource: updateSeo,
  publishResource: publishSeoHandler,
  unpublishResource: unpublishSeoHandler,
  archiveResource: archiveSeoHandler,
  restoreResource: restoreSeoHandler,
  scheduleResource: scheduleSeoHandler,
} = createSingletonController({ service, resourceName: "SEO settings" });

export {
  getPublicSeo,
  getAdminSeo,
  updateSeo,
  publishSeoHandler as publishSeo,
  unpublishSeoHandler as unpublishSeo,
  archiveSeoHandler as archiveSeo,
  restoreSeoHandler as restoreSeo,
  scheduleSeoHandler as scheduleSeo,
};
