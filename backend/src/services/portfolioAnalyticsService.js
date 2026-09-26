import mongoose from "mongoose";
import PortfolioAnalyticsEvent from "../models/PortfolioAnalyticsEvent.js";
import Project from "../models/Project.js";
import { CONTENT_STATUS_PUBLISHED } from "../constants/index.js";

const GRANULARITIES = new Set(["daily", "weekly", "monthly", "yearly"]);
const TYPE_MAP = { daily: "day", weekly: "week", monthly: "month", yearly: "year" };

export function parseAnalyticsRange(query = {}) {
  const end = query.to ? new Date(query.to) : new Date();
  const start = query.from ? new Date(query.from) : new Date(end.getTime() - 29 * 86400000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    const error = new Error("A valid date range is required.");
    error.statusCode = 400;
    throw error;
  }
  if (query.to && /^\d{4}-\d{2}-\d{2}$/.test(query.to)) end.setUTCHours(23, 59, 59, 999);
  return { start, end, granularity: GRANULARITIES.has(query.granularity) ? query.granularity : "daily" };
}

function rangeMatch(start, end) { return { createdAt: { $gte: start, $lte: end } }; }

export async function recordPortfolioEvent(input) {
  const { type, visitorId, sessionId, page, referrer = "Direct", projectId = null } = input;
  if (!["page_view", "download", "contact_request", "project_view"].includes(type)) return null;
  if (!/^[\w-]{10,40}$/.test(visitorId) || !/^[\w-]{10,40}$/.test(sessionId)) return null;
  let safeProjectId = null;
  if (type === "project_view") {
    if (!mongoose.Types.ObjectId.isValid(projectId)) return null;
    const project = await Project.findOne({ _id: projectId, status: CONTENT_STATUS_PUBLISHED }).select("_id").lean();
    if (!project) return null;
    safeProjectId = project._id;
  }
  const safePage = typeof page === "string" && page.startsWith("/") ? page.slice(0, 160) : "/";
  const safeReferrer = typeof referrer === "string" ? referrer.slice(0, 160) : "Direct";
  return PortfolioAnalyticsEvent.create({ type, visitorId, sessionId, page: safePage, referrer: safeReferrer || "Direct", projectId: safeProjectId });
}

async function totalsForRange(match) {
  const [types, visitors, sessions] = await Promise.all([
    PortfolioAnalyticsEvent.aggregate([
      { $match: match },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]),
    PortfolioAnalyticsEvent.distinct("visitorId", { ...match, type: "page_view" }),
    PortfolioAnalyticsEvent.distinct("sessionId", { ...match, type: "page_view" }),
  ]);
  const count = Object.fromEntries(types.map(({ _id, count: n }) => [_id, n]));
  return {
    visitors: visitors.length,
    sessions: sessions.length,
    downloads: count.download ?? 0,
    contactRequests: count.contact_request ?? 0,
    projectViews: count.project_view ?? 0,
  };
}

async function timeSeriesForRange(match, granularity) {
  return PortfolioAnalyticsEvent.aggregate([
    { $match: match },
    { $group: {
      _id: { $dateTrunc: { date: "$createdAt", unit: TYPE_MAP[granularity], startOfWeek: "monday", timezone: "UTC" } },
      visitors: { $addToSet: { $cond: [{ $eq: ["$type", "page_view"] }, "$visitorId", null] } },
      sessions: { $addToSet: { $cond: [{ $eq: ["$type", "page_view"] }, "$sessionId", null] } },
      downloads: { $sum: { $cond: [{ $eq: ["$type", "download"] }, 1, 0] } },
      contactRequests: { $sum: { $cond: [{ $eq: ["$type", "contact_request"] }, 1, 0] } },
      projectViews: { $sum: { $cond: [{ $eq: ["$type", "project_view"] }, 1, 0] } },
    } },
    { $project: { _id: 0, date: "$_id", visitors: { $size: { $setDifference: ["$visitors", [null]] } }, sessions: { $size: { $setDifference: ["$sessions", [null]] } }, downloads: 1, contactRequests: 1, projectViews: 1 } },
    { $sort: { date: 1 } },
  ]);
}

async function popularProjectsForRange(match) {
  return PortfolioAnalyticsEvent.aggregate([
    { $match: { ...match, type: "project_view", projectId: { $ne: null } } },
    { $group: { _id: "$projectId", views: { $sum: 1 } } },
    { $sort: { views: -1 } }, { $limit: 10 },
    { $lookup: { from: "projects", localField: "_id", foreignField: "_id", as: "project" } },
    { $unwind: { path: "$project", preserveNullAndEmptyArrays: true } },
    { $project: { _id: 0, projectId: "$_id", title: { $ifNull: ["$project.title", "Deleted project"] }, views: 1 } },
  ]);
}

async function popularTechnologiesForRange(match) {
  return PortfolioAnalyticsEvent.aggregate([
    { $match: { ...match, type: "project_view", projectId: { $ne: null } } },
    { $lookup: { from: "projects", localField: "projectId", foreignField: "_id", as: "project" } },
    { $unwind: "$project" }, { $unwind: "$project.technologies" }, { $unwind: "$project.technologies.items" },
    { $group: { _id: "$project.technologies.items", views: { $sum: 1 } } },
    { $sort: { views: -1 } }, { $limit: 10 },
    { $project: { _id: 0, technology: "$_id", views: 1 } },
  ]);
}

async function referrersForRange(match) {
  return PortfolioAnalyticsEvent.aggregate([
    { $match: { ...match, type: "page_view", referrer: { $nin: ["", "Direct"] } } },
    { $group: { _id: "$referrer", visits: { $sum: 1 } } },
    { $sort: { visits: -1 } }, { $limit: 10 },
    { $project: { _id: 0, referrer: "$_id", visits: 1 } },
  ]);
}

export async function getPortfolioAnalytics(query = {}) {
  const range = parseAnalyticsRange(query);
  const match = rangeMatch(range.start, range.end);
  const [totals, series, popularProjects, popularTechnologies, referrers] = await Promise.all([
    totalsForRange(match),
    timeSeriesForRange(match, range.granularity),
    popularProjectsForRange(match),
    popularTechnologiesForRange(match),
    referrersForRange(match),
  ]);
  return { ...range, totals, series, popularProjects, popularTechnologies, referrers };
}

export async function exportPortfolioAnalyticsCsv(query = {}) {
  const data = await getPortfolioAnalytics(query);
  const cell = (value) => {
    let text = String(value ?? "");
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
  };
  const rows = [
    ["Summary"],
    ["Metric", "Value"],
    ...Object.entries(data.totals).map(([key, value]) => [key, value]),
    [],
    ["Time series", data.granularity],
    ["Date", "Visitors", "Sessions", "Downloads", "Contact requests", "Project views"],
    ...data.series.map((row) => [row.date.toISOString(), row.visitors, row.sessions, row.downloads, row.contactRequests, row.projectViews]),
    [],
    ["Popular projects"], ["Project", "Views"],
    ...data.popularProjects.map((row) => [row.title, row.views]),
    [],
    ["Popular technologies"], ["Technology", "Views"],
    ...data.popularTechnologies.map((row) => [row.technology, row.views]),
    [],
    ["Referrers"], ["Referrer", "Visits"],
    ...data.referrers.map((row) => [row.referrer, row.visits]),
  ];
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
