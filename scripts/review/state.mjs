// Round state of a review. The brief starts with a hidden marker that holds
// the round number, the reviewed head commit and the fingerprints of the
// posted findings. The next run reads the newest marker and plans its round
// from it. Pure: comments in, state out.

import { BOT_LOGIN, MARKER_PREFIX, MAX_ROUNDS } from './config.mjs';

/**
 * The state that the marker holds.
 * @typedef {object} ReviewState
 * @property {number} round the round that posted the marker
 * @property {string} head the head commit that round reviewed
 * @property {string[]} posted fingerprints of every finding posted so far
 */

/**
 * A pull request comment, in the fields the GitHub API returns.
 * @typedef {object} Comment
 * @property {{ login: string }} user
 * @property {string} body
 * @property {string} created_at
 */

const MARKER_END = ' -->';
const SHA_PATTERN = /^[0-9a-f]{40}$/;
const FINGERPRINT_PATTERN = /^[0-9a-f]{16}$/;

/** @param {unknown} value */
const isRound = (value) => Number.isInteger(value) && value >= 1;

/** @param {unknown} value */
const isFingerprintList = (value) =>
  Array.isArray(value) &&
  value.every((item) => FINGERPRINT_PATTERN.test(String(item)));

/**
 * Whether a parsed marker has the expected shape. Fields other than these
 * three are not allowed, so a future marker version is not read by mistake.
 * @param {unknown} data
 * @returns {data is ReviewState}
 */
function isValidState(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return false;
  }
  const keys = Object.keys(data).sort().join(',');
  return (
    keys === 'head,posted,round' &&
    isRound(data.round) &&
    SHA_PATTERN.test(String(data.head)) &&
    isFingerprintList(data.posted)
  );
}

/**
 * The marker line for the brief.
 * @param {ReviewState} state
 */
export function writeMarker({ round, head, posted }) {
  return `${MARKER_PREFIX}${JSON.stringify({ round, head, posted })}${MARKER_END}`;
}

/**
 * The state in a comment body, or undefined. The marker counts only on the
 * first line of the body, where the hub writes it, so a marker that is quoted
 * further down in another comment is not read.
 * @param {string} body
 * @returns {ReviewState | undefined}
 */
export function readMarker(body) {
  const [firstLine] = body.split('\n', 1);
  if (!firstLine.startsWith(MARKER_PREFIX) || !firstLine.endsWith(MARKER_END)) {
    return undefined;
  }
  const json = firstLine.slice(MARKER_PREFIX.length, -MARKER_END.length);
  try {
    const data = JSON.parse(json);
    return isValidState(data) ? data : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The state from the newest valid marker in comments by the account that
 * runs the review workflow. Markers from any other account are ignored.
 * @param {Comment[]} comments
 * @param {string} [botLogin]
 * @returns {ReviewState | undefined}
 */
export function latestState(comments, botLogin = BOT_LOGIN) {
  const newestFirst = comments
    .filter((comment) => comment.user?.login === botLogin)
    .toSorted((a, b) => b.created_at.localeCompare(a.created_at));
  for (const comment of newestFirst) {
    const state = readMarker(comment.body ?? '');
    if (state) {
      return state;
    }
  }
  return undefined;
}

/**
 * The plan of the next round from the previous state. `limitReached` means
 * the hub posts the limit comment and runs no model.
 * @param {ReviewState | undefined} previous
 * @param {number} [maxRounds]
 */
export function nextRound(previous, maxRounds = MAX_ROUNDS) {
  if (!previous) {
    return {
      round: 1,
      previousHead: undefined,
      posted: [],
      limitReached: false,
    };
  }
  const round = previous.round + 1;
  return {
    round,
    previousHead: previous.head,
    posted: previous.posted,
    limitReached: round > maxRounds,
  };
}