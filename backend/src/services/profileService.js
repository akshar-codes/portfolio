import {
  getSingleton,
  findDefault,
  create,
} from "../repositories/profileRepository.js";
import { createSingletonService } from "./SingletonService.js";
import { sanitizeRichText } from "../utils/htmlSanitizer.js";
import { ServiceError } from "./ServiceError.js";

const repository = { getSingleton, findDefault, create };

const PATCHABLE_FIELDS = [
  "name",
  "title",
  "introduction",
  "email",
  "phone",
  "location",
  "avatar",
  "socialLinks",
  "ctaButtons",
  "statistics",
];

const ORDERED_ARRAY_FIELDS = ["socialLinks", "ctaButtons", "statistics"];

// Required-by-schema fields need a default so the singleton can be
// created on first read/write without the caller having to supply
// them — mirrors the fallback the old Profile.getSingleton() static
// used to provide directly on the model.
const DEFAULTS = {
  name: "Your Name",
  title: "Web Developer",
  email: "you@example.com",
};

const {
  fetchAdmin: fetchAdminProfile,
  fetchPublic: fetchPublicProfile,
  patchSingleton: patchProfileRaw,
  publish: publishProfile,
  unpublish: unpublishProfile,
  archive: archiveProfile,
  restore: restoreProfile,
  schedule: scheduleProfile,
  invalidateCache: invalidateProfileCache,
} = createSingletonService({
  repository,
  cacheKey: "profile:public",
  patchableFields: PATCHABLE_FIELDS,
  orderedArrayFields: ORDERED_ARRAY_FIELDS,
  defaults: DEFAULTS,
  resourceName: "Profile",
});

/**
 * Sanitizes rich text before delegating to the generic singleton PATCH.
 * Client-side DOMPurify (RichTextEditor.jsx) is a UX safeguard, not a
 * security boundary — this is the real defense against stored XSS for
 * a field rendered with dangerouslySetInnerHTML on the public site.
 */
const patchProfile = async (updates) => {
  const sanitized = { ...updates };
  if (typeof sanitized.introduction === "string") {
    sanitized.introduction = sanitizeRichText(sanitized.introduction);
  }
  return patchProfileRaw(sanitized);
};

const readJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(12000),
    headers: { Accept: "application/json", "User-Agent": "Portfolio-Stats/1.0", ...options.headers },
  });
  if (!response.ok) {
    throw new ServiceError(`Statistics provider returned ${response.status}. Check the account details and try again.`, 502, "STAT_PROVIDER_ERROR");
  }
  return response.json();
};

async function fetchStatisticValue(source, sourceUsername) {
  const username = sourceUsername?.trim();
  if (!username) throw new ServiceError("Enter a platform username first.", 400, "STAT_USERNAME_REQUIRED");

  if (source === "github") {
    const repo = username.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:@([A-Za-z0-9_.-]+))?$/);
    if (!repo) throw new ServiceError("For GitHub, enter owner/repository or owner/repository@username. This counts commits authored by that GitHub user in the repository.", 400, "GITHUB_REPO_REQUIRED");
    const author = repo[3] || repo[1];
    const url = `https://api.github.com/repos/${repo[1]}/${repo[2]}/commits?author=${encodeURIComponent(author)}&per_page=100`;
    const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
    const firstResponse = await fetch(url, { headers: { Accept: "application/vnd.github+json", "User-Agent": "Portfolio-Stats/1.0", ...headers }, signal: AbortSignal.timeout(12000) });
    if (!firstResponse.ok) throw new ServiceError(`GitHub returned ${firstResponse.status}. Confirm the public repository and try again.`, 502, "STAT_PROVIDER_ERROR");
    const firstPage = await firstResponse.json();
    const link = firstResponse.headers.get("link") || "";
    const lastUrl = link.match(/<([^>]+)>;\s*rel="last"/)?.[1];
    if (!lastUrl) return firstPage.length;
    const lastResponse = await fetch(lastUrl, { headers: { Accept: "application/vnd.github+json", "User-Agent": "Portfolio-Stats/1.0", ...headers }, signal: AbortSignal.timeout(12000) });
    if (!lastResponse.ok) throw new ServiceError("Could not read the final GitHub commit page.", 502, "STAT_PROVIDER_ERROR");
    const lastPage = await lastResponse.json();
    const lastNumber = Number(new URL(lastUrl).searchParams.get("page"));
    return (lastNumber - 1) * 100 + lastPage.length;
  }

  if (source === "leetcode") {
    const payload = await readJson("https://leetcode.com/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({ query: "query userStats($username: String!) { matchedUser(username: $username) { submitStats { acSubmissionNum { difficulty count } } } }", variables: { username } }),
    });
    if (payload.errors?.length || !payload.data?.matchedUser) throw new ServiceError("LeetCode profile was not found or its stats are unavailable.", 404, "STAT_PROFILE_NOT_FOUND");
    const all = payload.data.matchedUser.submitStats.acSubmissionNum.find((item) => item.difficulty === "All");
    if (!all) throw new ServiceError("LeetCode did not return an all-problems total.", 502, "STAT_PROVIDER_ERROR");
    return all.count;
  }

  if (source === "codeforces") {
    const payload = await readJson(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=10000`);
    if (payload.status !== "OK") throw new ServiceError(payload.comment || "Codeforces profile could not be read.", 404, "STAT_PROFILE_NOT_FOUND");
    const solved = new Set();
    for (const submission of payload.result) {
      if (submission.verdict === "OK" && submission.problem?.contestId != null && submission.problem?.index) {
        solved.add(`${submission.problem.contestId}-${submission.problem.index}`);
      }
    }
    return solved.size;
  }

  if (source === "codechef") {
    throw new ServiceError("CodeChef does not provide a stable public API for this count. Use Manual for CodeChef, or select LeetCode/Codeforces for automatic refresh.", 400, "STAT_SOURCE_UNSUPPORTED");
  }
  throw new ServiceError("Select a supported automatic source or use Manual.", 400, "STAT_SOURCE_UNSUPPORTED");
}

const refreshStatistic = async (statId) => {
  const doc = await repository.findDefault();
  const stat = doc?.statistics.id(statId);
  if (!stat) throw new ServiceError("Statistic not found.", 404, "STAT_NOT_FOUND");
  if (!stat.source || stat.source === "manual") throw new ServiceError("This statistic is set to Manual.", 400, "STAT_MANUAL_SOURCE");
  const sources = stat.sources?.length
    ? stat.sources.map(({ platform, username, mode, value }) => ({ platform, username, mode, value }))
    : [{ platform: stat.source, username: stat.sourceUsername }];
  const results = await Promise.all(sources.map(async ({ platform, username, mode = "auto", value = 0 }) => ({
    platform,
    username,
    mode,
    value: mode === "manual" ? Number(value) || 0 : await fetchStatisticValue(platform, username),
  })));
  stat.value = results.reduce((sum, result) => sum + result.value, 0);
  stat.sourceResults = results;
  stat.sourceLastFetchedAt = new Date();
  await doc.save();
  invalidateProfileCache();
  return { statistic: stat.toObject(), profile: doc.toObject() };
};

export {
  fetchAdminProfile,
  fetchPublicProfile,
  patchProfile,
  refreshStatistic,
  publishProfile,
  unpublishProfile,
  archiveProfile,
  restoreProfile,
  scheduleProfile,
  invalidateProfileCache,
};
