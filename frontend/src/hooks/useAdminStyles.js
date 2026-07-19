import { useEffect } from "react";

/**
 * Dynamically appends the admin stylesheet to the document head when mounted,
 * and removes it when unmounted. This perfectly isolates the global admin
 * CSS styles from the public pages without requiring CSS modules or refactoring.
 */
export function useAdminStyles() {
  useEffect(() => {
    // Check if it already exists to prevent duplicates
    if (document.getElementById("admin-styles")) return;

    const link = document.createElement("link");
    link.id = "admin-styles";
    link.rel = "stylesheet";
    link.href = "/admin.css"; // Loaded from public directory
    document.head.appendChild(link);

    return () => {
      // Remove when the admin layout unmounts (e.g. navigating to public pages)
      const existingLink = document.getElementById("admin-styles");
      if (existingLink) {
        document.head.removeChild(existingLink);
      }
    };
  }, []);
}
