import { useEffect, useState, useCallback } from "react";

const GLOBAL_SEARCH_EVENT = "open-global-search";

/**
 * Triggers the global search dialog to open. Can be called from anywhere.
 */
export function openGlobalSearch() {
  window.dispatchEvent(new Event(GLOBAL_SEARCH_EVENT));
}

/**
 * Manages the open/close state of the Global Search dialog.
 * Also sets up the Cmd+K / Ctrl+K keyboard shortcut listener at the window level.
 * This hook is meant to be used ONCE by the root AdminLayout to mount the dialog.
 */
export function useGlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleGlobalEvent = () => open();
    window.addEventListener(GLOBAL_SEARCH_EVENT, handleGlobalEvent);
    
    return () => {
      window.removeEventListener(GLOBAL_SEARCH_EVENT, handleGlobalEvent);
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K (Windows/Linux) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault(); // Prevent default browser search behavior
        open();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return { isOpen, open, close };
}
