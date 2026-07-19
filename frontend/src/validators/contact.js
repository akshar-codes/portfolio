/** Validates the public contact form's required fields before submit. */
export function isContactFormValid({ fullname, email, message }) {
  return Boolean(fullname?.trim() && email?.trim() && message?.trim());
}
