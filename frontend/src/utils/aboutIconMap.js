export const ABOUT_ICON_MAP = {
  web: "/images/icon-dev.svg",
  ai: "/images/microchip-ai.png",
  dsa: "/images/chart-tree.png",
  backend: "/images/icon-app.svg",
};

/** Ordered list used in the admin icon-picker UI. */
export const ABOUT_ICON_OPTIONS = [
  {
    key: "web",
    label: "Web Development",
    src: "/images/icon-dev.svg",
  },
  {
    key: "ai",
    label: "AI & Machine Learning",
    src: "/images/microchip-ai.png",
  },
  {
    key: "dsa",
    label: "Data Structures & Algos",
    src: "/images/chart-tree.png",
  },
  {
    key: "backend",
    label: "Backend & App Development",
    src: "/images/icon-app.svg",
  },
];

/**
 * Resolves an icon key to its image path.
 * Falls back to the "web" icon so service cards never render broken images.
 */
export function resolveAboutIcon(key) {
  if (!key) return ABOUT_ICON_MAP.web;
  return ABOUT_ICON_MAP[key.toLowerCase()] ?? ABOUT_ICON_MAP.web;
}
