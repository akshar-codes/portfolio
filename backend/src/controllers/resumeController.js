import { fetchResume, patchResume } from "../services/resumeService.js";
import { createSingletonController } from "./SingletonController.js";

const service = {
  fetchSingleton: fetchResume,
  patchSingleton: patchResume,
};

const { getResource: getResume, updateResource: updateResume } =
  createSingletonController({
    service,
    resourceName: "Resume",
  });

export { getResume, updateResume };
