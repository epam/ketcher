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
 *   baseMoved?: boolean,
 * }} RangeInput
 * @typedef {{ from: string, to: string, kind: 'full' | 'incremental' }} Range
 */

/**
 * The commit range to review. Whichever range it gives holds the commits of
 * the pull request alone, and never a commit of the base branch: `full` is
 * base...head, measured from the merge base, so the base branch falls out of
 * it by construction.
 *
 * `incremental`, previousHead..head, keeps that true only while the merge
 * base has not moved. A base branch merged into the branch between two
 * rounds sits inside previousHead..head, which would review other people's
 * commits, charge for them, and leave inline comments on lines the pull
 * request diff does not hold, which GitHub refuses. So a round takes the
 * incremental range only when the previous head is still on the branch (no
 * force push) and the merge base is the one that round saw.
 * @param {RangeInput} input
 * @returns {Range}
 */
export function reviewRange({
  round,
  base,
  head,
  previousHead,
  previousHeadIsAncestor,
  baseMoved,
}) {
  if (round > 1 && previousHead && previousHeadIsAncestor && !baseMoved) {
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
