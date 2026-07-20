import { body } from "express-validator";
import {
  optionalTrimmedString,
  optionalUrl,
  optionalHexColor,
  optionalEmail,
  optionalBoolean,
} from "./common.js";

export const updateSiteSettingsValidator = [
  body("siteName")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Site name cannot be empty")
    .isLength({ min: 2, max: 100 })
    .withMessage("Site name must be 2-100 characters"),

  optionalTrimmedString("tagline", { max: 200 }),
  optionalUrl("logoUrl"),
  optionalUrl("faviconUrl"),
  optionalHexColor("primaryColor"),
  optionalHexColor("secondaryColor"),
  optionalEmail("contactEmail"),
  optionalBoolean("maintenanceMode"),
  optionalTrimmedString("maintenanceMessage", { max: 500 }),
  optionalTrimmedString("timezone", { max: 60 }),
  optionalTrimmedString("defaultLocale", { max: 10 }),
];
