// Which commits and which files a review round looks at. Pure: the caller
// runs git and passes the answers in.

import { globToRegExp } from '../agent-docs/paths.mjs';
import { SKIP_PATHS } from './config.mjs';
import { filePath } from './diff.mjs';

/**
 * @typedef {{
 *   round: number,
 *   base: string,
 *   head: string,
 *   previousHead?: string,
 *   previousHeadIsAncestor?: boolean,
 * }} RangeInput
 * @typedef {{ from: string, to: string, kind: 'full' | 'incremental' }} Range
 */

/**
 * The commit range to review. Round 1 reviews the whole pull request. A
 * later round reviews only the commits since the head of the previous round,
 * unless that head is gone from the branch (a force push or a rebase).
 * `full` means base...head (from the merge base); `incremental` means
 * previousHead..head.
 * @param {RangeInput} input
 * @returns {Range}
 */
export function reviewRange({
  round,
  base,
  head,
  previousHead,
  previousHeadIsAncestor,
}) {
  if (round > 1 && previousHead && previousHeadIsAncestor) {
    return { from: previousHead, to: head, kind: 'incremental' };
  }
  return { from: base, to: head, kind: 'full' };
}

/**
 * Splits the diff into the files the finder passes see and the files they
 * skip, and joins the reviewed files back into one diff text.
 * @param {import('./diff.mjs').DiffFile[]} files
 * @param {string[]} [skipGlobs]
 */
export function filterDiff(files, skipGlobs = SKIP_PATHS) {
  const skip = skipGlobs.map(globToRegExp);
  const isSkipped = (file) => skip.some((re) => re.test(filePath(file)));
  const reviewed = files.filter((file) => !isSkipped(file));
  return {
    reviewed,
    skipped: files.filter(isSkipped).map(filePath),
    text: reviewed.map((file) => file.patch).join('\n'),
  };
}
