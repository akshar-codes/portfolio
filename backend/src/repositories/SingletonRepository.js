/**
 * Factory that builds the standard data-access layer for a singleton
 * ("owner: default") Mongoose model.
 *
 * Every resource-specific repository (siteSettingsRepository.js,
 * navigationRepository.js, footerRepository.js, seoRepository.js, ...)
 * delegates to this factory instead of re-implementing the same three
 * queries that About/Profile/Resume already duplicated independently.
 *
 * @param {import("mongoose").Model} Model - a Mongoose model whose schema
 *   has been extended with `singletonPlugin` (i.e. has an `owner` field).
 * @returns {{
 *   getSingleton: (defaults?: object) => Promise<object>,
 *   findDefault: () => import("mongoose").Query,
 *   create: (data?: object) => Promise<import("mongoose").Document>,
 *   Model: import("mongoose").Model,
 * }}
 */
export function createSingletonRepository(Model) {
  /** Creates the singleton document, always pinned to owner: "default". */
  const create = (data = {}) => Model.create({ owner: "default", ...data });

  /**
   * Returns the singleton document as a plain object, creating it
   * (seeded with `defaults`) the first time it's requested.
   */
  const getSingleton = async (defaults = {}) => {
    let doc = await Model.findOne({ owner: "default" }).lean();
    if (!doc) {
      const created = await create(defaults);
      doc = created.toObject();
    }
    return doc;
  };

  /** Returns the hydrated singleton document (or null), for mutation. */
  const findDefault = () => Model.findOne({ owner: "default" });

  return { getSingleton, findDefault, create, Model };
}

export default createSingletonRepository;
