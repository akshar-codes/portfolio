import Profile from "../models/Profile.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } = createSingletonRepository(Profile);

export { getSingleton, findDefault, create };
