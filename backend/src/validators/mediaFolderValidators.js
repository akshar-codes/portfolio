import { body, param } from "express-validator";

export const mediaFolderIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid folder ID"),
];

export const createMediaFolderValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required")
    .isLength({ min: 1, max: 60 })
    .withMessage("Folder name must be 1-60 characters"),
  body("parentId").optional({ nullable: true, checkFalsy: true }).isMongoId().withMessage("Invalid parent folder"),
];

export const updateMediaFolderValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Folder name is required")
    .isLength({ min: 1, max: 60 })
    .withMessage("Folder name must be 1-60 characters"),
];
