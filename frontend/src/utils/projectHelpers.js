/** Flattens either shape into a plain string[] for compact list display. */
export function flattenTechNames(technologies) {
  if (!Array.isArray(technologies) || technologies.length === 0) return [];

  const isGrouped =
    typeof technologies[0] === "object" &&
    technologies[0] !== null &&
    "group" in technologies[0];

  if (isGrouped) {
    return technologies.flatMap((g) => g.items ?? []);
  }

  return technologies.filter((t) => typeof t === "string");
}

/** Normalises incoming technologies (legacy flat or grouped) to grouped shape. */
export function normaliseTechnologies(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  if (typeof raw[0] === "object" && raw[0] !== null && "group" in raw[0]) {
    return raw;
  }
  const items = raw.filter((t) => typeof t === "string" && t.trim());
  return items.length ? [{ group: "General", items }] : [];
}
