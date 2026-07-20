import {
  fetchNavigation,
  patchNavigation,
} from "../services/navigationService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchSingleton: fetchNavigation,
  patchSingleton: patchNavigation,
};

const { getResource: getNavigation, updateResource: updateNavigation } =
  createSingletonController({
    service,
    resourceName: "Navigation",
  });

export { getNavigation, updateNavigation };
