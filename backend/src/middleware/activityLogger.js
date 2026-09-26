import { recordActivity } from "../services/activityLogService.js";
import logger from "../utils/logger.js";

const LABELS = {
  projects: "project", categories: "category", about: "about", profile: "profile",
  resume: "resume", navigation: "navigation", footer: "footer", seo: "SEO",
  "site-settings": "site settings", media: "media", "media-folders": "media folder",
};

function identify(req) {
  const path = req.originalUrl.split("?")[0];
  const isProjectMount = path.startsWith("/api/projects");
  const parts = path.replace(isProjectMount ? /^\/api\/projects\/?/ : /^\/api\/admin\/?/, "").split("/").filter(Boolean);
  if (isProjectMount && req.admin) parts.unshift("projects");
  const resource = LABELS[parts[0]];
  if (!resource || ["activity", "verify", "login", "logout"].includes(parts[0])) return null;

  const actionSegment = parts.find((part) => ["publish", "unpublish"].includes(part));
  if (actionSegment) return { action: actionSegment, resource };

  if (parts.some((part) => part === "bulk-delete" || part === "bulk-permanent-delete")) {
    return { action: "delete", resource };
  }

  if (parts[0] === "media" && (req.method === "POST" && parts.length === 1 || parts.includes("replace"))) {
    return { action: "media_upload", resource };
  }

  const method = req.method.toUpperCase();
  const isSingleton = ["about", "profile", "resume", "navigation", "footer", "seo", "site-settings"].includes(parts[0]);
  if (method === "POST" && (parts.length === 1 || (isProjectMount && parts.length === 1))) return { action: "create", resource };
  if (method === "DELETE") return { action: "delete", resource };
  if (method === "PATCH" || method === "PUT") return { action: "update", resource };
  return null;
}

export default function activityLogger(req, res, next) {
  res.on("finish", () => {
    if (res.statusCode < 200 || res.statusCode >= 300) return;
    const url = req.originalUrl.split("?")[0];
    const item = identify(req);
    if (url === "/api/admin/logout") {
      void recordActivity({ actor: req.admin, action: "logout", resource: "admin", description: `${req.admin?.username ?? "Admin"} logged out`, ip: req.ip, method: req.method, path: url })
        .catch((err) => logger.error("Failed to persist activity log", { message: err.message }));
      return;
    }
    if (!req.admin || !item) return;
    const pathParts = url.split("/").filter(Boolean);
    const pathId = pathParts.find((part) => /^[a-f\d]{24}$/i.test(part));
    const id = req.params?.id || req.body?._id || pathId || "";
    const actionVerb = { create: "created", update: "updated", delete: "deleted", publish: "published", unpublish: "unpublished", media_upload: "uploaded media" }[item.action];
    const detail = `${actionVerb} ${item.resource}`;
    const events = [{ actor: req.admin, ...item, resourceId: id, description: `${req.admin.username} ${detail}`, ip: req.ip, method: req.method, path: url }];
    if ((req.file || req.files) && item.action !== "media_upload") {
      events.push({ actor: req.admin, action: "media_upload", resource: "media", resourceId: id, description: `${req.admin.username} uploaded media for ${item.resource}`, ip: req.ip, method: req.method, path: url });
    }
    if (url === "/api/admin/media" && req.method === "POST") {
      events.push({ actor: req.admin, action: "create", resource: "media", resourceId: id, description: `${req.admin.username} created a media item`, ip: req.ip, method: req.method, path: url });
    }
    void Promise.all(events.map((event) => recordActivity(event)))
      .catch((err) => logger.error("Failed to persist activity log", { message: err.message }));
  });
  next();
}
