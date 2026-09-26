import ContentVersion from "../ContentVersion.js";

const INTERNAL_FIELDS = new Set(["_id", "__v", "createdAt", "updatedAt"]);

/** Save a before-image whenever a persisted CMS document is changed. */
export default function versionHistoryPlugin(schema) {
  schema.pre("save", async function recordBeforeImage() {
    if (this.isNew || !this.isModified()) return;
    const before = await this.constructor.findById(this._id).lean();
    if (!before) return;
    const changed = this.modifiedPaths().some((path) => !INTERNAL_FIELDS.has(path.split(".")[0]));
    if (changed) {
      await ContentVersion.create({ resource: this.constructor.modelName, resourceId: this._id, snapshot: before });
    }
  });
}
