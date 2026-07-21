import Resume from "../models/Resume.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } = createSingletonRepository(Resume);

export { getSingleton, findDefault, create };
