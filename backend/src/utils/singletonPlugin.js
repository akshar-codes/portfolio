/**
 * Mongoose schema plugin that turns a schema into a singleton-per-owner
 * document store.
 *
 * Mirrors the "owner: default" pattern already used by About/Profile/Resume,
 * extracted here so every future CMS singleton model (SiteSettings,
 * Navigation, Footer, SEO, ...) declares the same field + index in one
 * line instead of re-typing the boilerplate.
 *
 * Usage:
 *   const mySchema = new mongoose.Schema({ ... });
 *   mySchema.plugin(singletonPlugin);
 *
 * The actual "find or create" / "find default" behaviour lives in
 * `SingletonRepository.js` — this plugin is only responsible for the
 * schema shape (owner field + unique sparse index), keeping data-access
 * logic out of the model layer.
 */
export default function singletonPlugin(schema) {
  schema.add({
    owner: {
      type: String,
      default: "default",
      immutable: true,
      match: [/^[a-z0-9_-]+$/, "Invalid owner value"],
    },
  });

  schema.index({ owner: 1 }, { unique: true, sparse: true });
}
