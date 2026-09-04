import { useSearchParams } from "react-router-dom";

export function usePreviewMode() {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "1";
  const previewProjectId = searchParams.get("projectId");
  
  return { isPreview, previewProjectId };
}
