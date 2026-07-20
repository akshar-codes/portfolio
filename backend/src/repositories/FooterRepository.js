import Footer from "../models/Footer.js";
import { createSingletonRepository } from "./SingletonRepository.js";

const { getSingleton, findDefault, create } =
  createSingletonRepository(Footer);

export { getSingleton, findDefault, create };
