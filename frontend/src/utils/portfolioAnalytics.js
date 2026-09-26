import api from "../services/api";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

function getId(storage, key) {
  try {
    let value = storage.getItem(key);
    if (!value) {
      value = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      storage.setItem(key, value);
    }
    return value;
  } catch {
    return globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

function getSessionId() {
  const storage = window.sessionStorage;
  const now = Date.now();
  const lastActivity = Number(storage.getItem("portfolio-analytics-session-touched") || 0);
  let id = storage.getItem("portfolio-analytics-session");
  if (!id || now - lastActivity > 30 * 60 * 1000) {
    id = globalThis.crypto?.randomUUID?.() || `${now}-${Math.random().toString(36).slice(2)}`;
    storage.setItem("portfolio-analytics-session", id);
    storage.removeItem("portfolio-analytics-entry-recorded");
  }
  storage.setItem("portfolio-analytics-session-touched", String(now));
  return id;
}

export function trackPortfolioEvent(type, { projectId } = {}) {
  if (typeof window === "undefined") return;
  let visitorId;
  let sessionId;
  try { visitorId = getId(window.localStorage, "portfolio-analytics-visitor"); }
  catch { visitorId = `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  try { sessionId = getSessionId(); }
  catch { sessionId = `${Date.now()}-${Math.random().toString(36).slice(2)}`; }
  let referrer = "Direct";
  try {
    const hasEntryPage = window.sessionStorage.getItem("portfolio-analytics-entry-recorded");
    if (type === "page_view" && !hasEntryPage && document.referrer) {
      const hostname = new URL(document.referrer).hostname;
      if (hostname && hostname !== window.location.hostname) referrer = hostname;
    }
    if (type === "page_view" && !hasEntryPage) window.sessionStorage.setItem("portfolio-analytics-entry-recorded", "1");
  } catch { /* ignore malformed browser referrer */ }
  void api.post(API_ENDPOINTS.portfolioAnalyticsEvent, {
    type, visitorId, sessionId, page: window.location.pathname, referrer, projectId,
  }).catch(() => {});
}
