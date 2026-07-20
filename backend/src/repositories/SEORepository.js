import SEO from "../models/SEO.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } = createSingletonRepository(SEO);

export { getSingleton, findDefault, create };
