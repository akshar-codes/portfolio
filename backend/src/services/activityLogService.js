import ActivityLog from "../models/ActivityLog.js";

const ACTIONS = new Set(["create", "update", "delete", "publish", "unpublish", "login", "logout", "media_upload"]);

export async function recordActivity({ actor, action, resource, resourceId = "", description, ip = "", method = "", path = "" }) {
  if (!ACTIONS.has(action)) return;
  return ActivityLog.create({
    actorId: actor?._id ?? null,
    actorName: String(actor?.username ?? "Unknown admin").slice(0, 80),
    action,
    resource: resource || "admin",
    resourceId: String(resourceId || "").slice(0, 100),
    description: String(description || `${action} ${resource || "admin"}`).slice(0, 300),
    ip: String(ip || "").slice(0, 64),
    method: String(method || "").slice(0, 10),
    path: String(path || "").slice(0, 300),
  });
}

function buildFilter({ action, resource, actor, from, to, search }) {
  const filter = {};
  if (action) filter.action = action;
  if (resource) filter.resource = resource;
  if (actor) filter.actorName = { $regex: escapeRegex(actor), $options: "i" };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (search) {
    const expression = new RegExp(escapeRegex(search), "i");
    filter.$or = [
      { actorName: expression }, { action: expression }, { resource: expression },
      { description: expression }, { ip: expression }, { path: expression },
    ];
  }
  return filter;
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

export async function listActivity(query = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 25));
  const filter = buildFilter(query);
  const [items, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1, _id: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    ActivityLog.countDocuments(filter),
  ]);
  return { items, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function exportActivity(query = {}) {
  const rows = await ActivityLog.find(buildFilter(query)).sort({ createdAt: -1, _id: -1 }).limit(50000).lean();
  const fields = ["createdAt", "actorName", "action", "resource", "resourceId", "description", "ip", "method", "path"];
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  return [fields.join(","), ...rows.map((row) => fields.map((field) => cell(row[field])).join(","))].join("\r\n");
}
