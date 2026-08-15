import { useEffect } from "react";

/**
 * Reads `settings.primaryColor` from the CMS SiteSettings singleton
 * and writes it to the public site's CSS custom properties on `:root`.
 *
 * Mapping strategy (deliberate and minimal):
 *   settings.primaryColor  → --accent
 *                            --accent-dark  (auto-derived: primaryColor at 80% lightness)
 *
 * `secondaryColor` is intentionally NOT mapped to a background variable —
 * it's a brand color field, and blindly overwriting --bg-primary would
 * break the dark theme for any value that isn't itself near-black.
 *
 * If `primaryColor` is absent or the settings query hasn't resolved yet,
 * the hook is a no-op and the CSS fallbacks in public.css remain active.
 */
export function useThemeColors(settings) {
  const primaryColor = settings?.primaryColor;

  useEffect(() => {
    if (!primaryColor) return;

    // Validate hex before writing — malformed values would silently
    // corrupt every color reference on the page.
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(primaryColor)) return;

    const root = document.documentElement;
    root.style.setProperty("--accent", primaryColor);

    // Derive --accent-dark: darken the primary by ~20% for hover states.
    // Simple approach: parse RGB and multiply each channel by 0.8.
    const hex = primaryColor.replace("#", "");
    const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6);
    const r = Math.round(parseInt(full.slice(0, 2), 16) * 0.8);
    const g = Math.round(parseInt(full.slice(2, 4), 16) * 0.8);
    const b = Math.round(parseInt(full.slice(4, 6), 16) * 0.8);
    const darkHex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    root.style.setProperty("--accent-dark", darkHex);
  }, [primaryColor]);
}

export default useThemeColors;
