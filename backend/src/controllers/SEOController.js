import { fetchSeo, patchSeo } from "../services/seoService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchSingleton: fetchSeo,
  patchSingleton: patchSeo,
};

const { getResource: getSeo, updateResource: updateSeo } =
  createSingletonController({
    service,
    resourceName: "SEO settings",
  });

export { getSeo, updateSeo };
