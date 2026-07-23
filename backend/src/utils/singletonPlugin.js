import { CONTENT_STATUSES, DEFAULT_CONTENT_STATUS } from "./constants.js";

/**
 * Mongoose schema plugin that turns a schema into a singleton-per-owner
 * document store with a publish/draft status.
 *
 * Mirrors the "owner: default" pattern already used by About/Profile/Resume,
 * extracted here so every CMS singleton model (SiteSettings, Navigation,
 * Footer, SEO, Resume, ...) declares the same fields + indexes in one
 * line instead of re-typing the boilerplate.
 *
 * Usage:
 *   const mySchema = new mongoose.Schema({ ... });
 *   mySchema.plugin(singletonPlugin);
 *
 * The actual "find or create" / "find default" behaviour lives in
 * `SingletonRepository.js`, and the public/admin/publish semantics live
 * in `SingletonService.js` — this plugin is only responsible for the
 * schema shape (owner field + status field + their indexes).
 */
export default function singletonPlugin(schema) {
  schema.add({
    owner: {
      type: String,
      default: "default",
      immutable: true,
      match: [/^[a-z0-9_-]+$/, "Invalid owner value"],
    },
    status: {
      type: String,
      enum: {
        values: CONTENT_STATUSES,
        message: `status must be one of: ${CONTENT_STATUSES.join(", ")}`,
      },
      default: DEFAULT_CONTENT_STATUS,
    },
  });

  schema.index({ owner: 1 }, { unique: true, sparse: true });
  schema.index({ status: 1 });
}
