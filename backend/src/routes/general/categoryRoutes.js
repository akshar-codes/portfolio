import express from "express";
import { getPublicCategories } from "../../controllers/categoryController.js";

const router = express.Router();

router.get("/", getPublicCategories);

export default router;
