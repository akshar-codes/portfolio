import { useContext } from "react";
import { GlobalLoadingContext } from "../contexts/GlobalLoadingContext";

export function useGlobalLoading() {
  const ctx = useContext(GlobalLoadingContext);
  if (!ctx) {
    throw new Error("useGlobalLoading must be used inside <GlobalLoadingProvider>");
  }
  return ctx;
}
