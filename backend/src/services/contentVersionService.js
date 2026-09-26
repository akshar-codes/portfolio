import mongoose from "mongoose";
import ContentVersion from "../models/ContentVersion.js";
import { ServiceError } from "./ServiceError.js";
import Project from "../models/Project.js";
import Category from "../models/Category.js";
import Profile from "../models/Profile.js";
import About from "../models/About.js";
import Resume from "../models/Resume.js";
import Footer from "../models/Footer.js";
import Navigation from "../models/Navigation.js";
import SEO from "../models/SEO.js";
import SiteSettings from "../models/SiteSettings.js";

const MODELS = new Map([Project, Category, Profile, About, Resume, Footer, Navigation, SEO, SiteSettings].map((model) => [model.modelName, model]));

function resolve(resource) {
  const model = MODELS.get(resource);
  if (!model) throw new ServiceError("Unsupported content resource.", 404, "CONTENT_RESOURCE_NOT_FOUND");
  return model;
}

export async function listContentVersions(resource, id) {
  resolve(resource);
  if (!mongoose.isValidObjectId(id)) throw new ServiceError("Invalid content ID.", 400, "CONTENT_ID_INVALID");
  return ContentVersion.find({ resource, resourceId: id }).sort({ createdAt: -1 }).limit(50).lean();
}

export async function restoreContentVersion(resource, id, versionId) {
  const Model = resolve(resource);
  const version = await ContentVersion.findOne({ _id: versionId, resource, resourceId: id }).lean();
  if (!version) throw new ServiceError("Content version not found.", 404, "CONTENT_VERSION_NOT_FOUND");
  const doc = await Model.findById(id);
  if (!doc) throw new ServiceError("Content not found.", 404, "CONTENT_NOT_FOUND");
  const current = doc.toObject();
  const historical = version.snapshot;
  for (const [key, value] of Object.entries(historical)) {
    if (["_id", "__v", "createdAt", "owner"].includes(key)) continue;
    doc.set(key, value);
  }
  await doc.save();
  // The pre-save hook records current before-image; keep restore itself auditable too.
  return { restored: doc, previous: current };
}
