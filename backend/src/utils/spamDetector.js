import { MESSAGE_SPAM_SCORE_THRESHOLD } from "../constants/index.js";

/* ------------------------------------------------------------------ *
 * Signal detectors
 * ------------------------------------------------------------------ */

const URL_PATTERN = /(https?:\/\/|www\.)\S+/gi;

// Deliberately small and generic — this is a first-line heuristic
// filter, not a comprehensive blocklist. Admins retain full visibility
// and can always override the verdict from the Messages dashboard.
const BLACKLISTED_KEYWORDS = [
  "viagra",
  "casino",
  "crypto airdrop",
  "make money fast",
  "click here",
  "work from home",
  "loan approved",
  "act now",
  "risk free",
  "weight loss pills",
  "seo services",
  "backlinks",
  "bitcoin investment",
  "forex signals",
  "guaranteed profit",
];

const EXCESSIVE_CAPS_RATIO = 0.6;
const MIN_LENGTH_FOR_CAPS_CHECK = 20;
const REPEATED_CHAR_PATTERN = /(.)\1{6,}/;

function countUrls(text = "") {
  const matches = text.match(URL_PATTERN);
  return matches ? matches.length : 0;
}

function matchedBlacklistedKeywords(text = "") {
  const lower = text.toLowerCase();
  return BLACKLISTED_KEYWORDS.filter((keyword) => lower.includes(keyword));
}

function capsRatio(text = "") {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < MIN_LENGTH_FOR_CAPS_CHECK) return 0;
  const upper = letters.replace(/[^A-Z]/g, "");
  return upper.length / letters.length;
}

function hasRepeatedCharacters(text = "") {
  return REPEATED_CHAR_PATTERN.test(text);
}

/* ------------------------------------------------------------------ *
 * analyzeSpam
 * ------------------------------------------------------------------ *
 * Lightweight heuristic spam scorer for public contact-form
 * submissions. Not a machine-learning classifier — a deterministic,
 * explainable rule set that flags the most common spam patterns (link
 * stuffing, blacklisted phrases, shouting, rapid resubmission from the
 * same IP) without any external dependency or network call. Each
 * signal contributes a fixed weight to `spamScore`; the caller decides
 * what to do with a score at/above MESSAGE_SPAM_SCORE_THRESHOLD —
 * flagged messages are never auto-deleted, only routed to the Spam
 * view, and an admin can override the verdict at any time.
 *
 * @param {object} input
 * @param {string} input.fullname
 * @param {string} input.email
 * @param {string} input.message
 * @param {number} [input.recentFromSameIp] - count of other messages
 *   from the same IP within the rapid-resubmission window (see
 *   repositories/messageRepository.js countRecentByIp).
 * @returns {{ isSpam: boolean, spamScore: number, reasons: string[] }}
 * ------------------------------------------------------------------ */
export function analyzeSpam({
  fullname = "",
  email = "",
  message = "",
  recentFromSameIp = 0,
}) {
  const reasons = [];
  let score = 0;

  const urlCount = countUrls(message);
  if (urlCount >= 3) {
    score += 40;
    reasons.push(`Contains ${urlCount} links`);
  } else if (urlCount >= 1) {
    score += 15;
    reasons.push(`Contains ${urlCount} link${urlCount > 1 ? "s" : ""}`);
  }

  const matchedKeywords = [
    ...new Set([
      ...matchedBlacklistedKeywords(message),
      ...matchedBlacklistedKeywords(fullname),
    ]),
  ];
  if (matchedKeywords.length > 0) {
    score += 30;
    reasons.push(`Matched flagged phrase: "${matchedKeywords[0]}"`);
  }

  if (capsRatio(message) >= EXCESSIVE_CAPS_RATIO) {
    score += 15;
    reasons.push("Excessive use of capital letters");
  }

  if (hasRepeatedCharacters(message)) {
    score += 10;
    reasons.push("Contains repeated character sequences");
  }

  if (recentFromSameIp > 0) {
    score += 25;
    reasons.push(
      "Repeated submission from the same IP address within a short window",
    );
  }

  if (message.trim().length < 10) {
    score += 10;
    reasons.push("Message is unusually short");
  }

  const spamScore = Math.min(score, 100);
  const isSpam = spamScore >= MESSAGE_SPAM_SCORE_THRESHOLD;

  return { isSpam, spamScore, reasons };
}

export default analyzeSpam;
