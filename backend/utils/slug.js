export function generateSlug(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // strip special chars (parens, slashes, etc.)
    .replace(/\s+/g, "-") // spaces → hyphens
    .replace(/-+/g, "-") // collapse consecutive hyphens
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens
}

export function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}
