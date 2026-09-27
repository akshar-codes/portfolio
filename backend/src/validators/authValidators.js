import { body } from "express-validator";

export const changePasswordValidator = [
  body("currentPassword")
    .isString()
    .withMessage("Current password is required")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isString()
    .withMessage("New password is required")
    .isLength({ min: 12 })
    .withMessage("New password must be at least 12 characters")
    .custom((password) => Buffer.byteLength(password, "utf8") <= 72)
    .withMessage("New password must be no more than 72 bytes"),
  body("confirmPassword")
    .isString()
    .withMessage("Confirm your new password")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Passwords do not match"),
];
