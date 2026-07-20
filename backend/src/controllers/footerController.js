import { fetchFooter, patchFooter } from "../services/footerService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchSingleton: fetchFooter,
  patchSingleton: patchFooter,
};

const { getResource: getFooter, updateResource: updateFooter } =
  createSingletonController({
    service,
    resourceName: "Footer",
  });

export { getFooter, updateFooter };
