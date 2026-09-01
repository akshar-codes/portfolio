import logger from "../utils/logger.js";
import {
  CONTENT_STATUS_SCHEDULED,
  CONTENT_STATUS_PUBLISHED,
} from "../constants/index.js";

/**
 * @typedef {object} SweepRegistration
 * @property {string} name - human-readable label for logging
 * @property {import("mongoose").Model} Model
 * @property {() => void} [onPublished] - cache-invalidation callback,
 *   called if at least one document in this model was promoted
 */

/**
 * Builds a sweep runner shared by every CMS module. Rather than
 * computing an "effective status" on every public read (which would
 * force every public query to become a range comparison and defeat
 * simple equality-based caching), scheduled content is promoted to
 * "published" in the database itself on a fixed interval. Public reads
 * stay a plain `status === "published"` check everywhere.
 *
 * @param {SweepRegistration[]} registrations
 */
export function createScheduledPublishSweep(registrations) {
  let running = false;

  const run = async () => {
    if (running) return; // avoid overlapping sweeps if one run is slow
    running = true;
    const now = new Date();

    try {
      for (const { name, Model, onPublished } of registrations) {
        try {
          const result = await Model.updateMany(
            { status: CONTENT_STATUS_SCHEDULED, publishAt: { $lte: now } },
            { $set: { status: CONTENT_STATUS_PUBLISHED, publishedAt: now } },
          );

          if (result.modifiedCount > 0) {
            logger.info(
              `[scheduledPublishSweep] Published ${result.modifiedCount} scheduled "${name}" document(s).`,
            );
            onPublished?.();
          }
        } catch (err) {
          logger.error(`[scheduledPublishSweep] Failed sweeping "${name}"`, {
            message: err.message,
          });
        }
      }
    } finally {
      running = false;
    }
  };

  let timer = null;

  const start = (intervalMs) => {
    run(); // catch anything due immediately on boot
    timer = setInterval(run, intervalMs);
    timer.unref?.(); // never keep the process alive on its own
    logger.info("[scheduledPublishSweep] Started", {
      intervalMs,
      modules: registrations.map((r) => r.name),
    });
  };

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  return { start, stop, run };
}

export default createScheduledPublishSweep;
