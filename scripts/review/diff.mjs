// Splits the unified diff that `git diff` and `gh pr diff` print into files,
// with the facts the hub needs. Parsing is done by the `diff` package (jsdiff).
// Pure: text in, data out. No file or process access.

import { formatPatch, parsePatch } from 'diff';

/**
 * @typedef {'added' | 'deleted' | 'modified' | 'renamed'} FileStatus
 * @typedef {{
 *   oldPath: string | null,
 *   newPath: string | null,
 *   status: FileStatus,
 *   binary: boolean,
 *   additions: number,
 *   deletions: number,
 *   commentableLines: Set<number>,
 *   patch: string,
 * }} DiffFile
 * `commentableLines` holds the lines of the new version that GitHub takes a
 * review comment on: added and context lines inside a hunk. `patch` is the
 * file's part of the diff as text, so the hub can pass on a diff without the
 * skipped files.
 */

// Helpers

/** Repo-relative path without git's `a/` or `b/`, or null for /dev/null. */
function stripSide(name) {
  if (name === undefined || name === '/dev/null') return null;
  return name.replace(/^[ab]\//, '');
}

/** @returns {FileStatus} */
function fileStatus(patch) {
  if (patch.isCreate) return 'added';
  if (patch.isDelete) return 'deleted';
  if (patch.isRename) return 'renamed';
  return 'modified';
}

/** Counts added and removed lines, and collects the commentable lines. */
function countLines(hunks) {
  let additions = 0;
  let deletions = 0;
  const commentableLines = new Set();
  for (const hunk of hunks) {
    let newLine = hunk.newStart;
    for (const line of hunk.lines) {
      if (line.startsWith('+')) {
        additions++;
        commentableLines.add(newLine++);
      } else if (line.startsWith('-')) {
        deletions++;
      } else if (line.startsWith(' ')) {
        commentableLines.add(newLine++);
      }
    }
  }
  return { additions, deletions, commentableLines };
}

/** @returns {DiffFile} */
function toDiffFile(patch) {
  return {
    oldPath: stripSide(patch.oldFileName),
    newPath: stripSide(patch.newFileName),
    status: fileStatus(patch),
    binary: patch.isBinary === true,
    ...countLines(patch.hunks),
    patch: formatPatch(patch).trimEnd(),
  };
}

// Public functions

/**
 * @param {string} text
 * @returns {DiffFile[]}
 */
export function parseDiff(text) {
  // jsdiff returns one entry without file names for text that holds no file.
  return parsePatch(text)
    .filter((patch) => patch.oldFileName || patch.newFileName)
    .map(toDiffFile);
}

/**
 * Path of the file as the pull request leaves it, or the old path for a
 * deleted file.
 * @param {DiffFile} file
 */
export function filePath(file) {
  return file.newPath ?? file.oldPath ?? '';
}

/**
 * Added plus removed lines over the given files.
 * @param {DiffFile[]} files
 */
export function changedLineCount(files) {
  return files.reduce((sum, file) => sum + file.additions + file.deletions, 0);
}

/**
 * Whether GitHub takes a review comment on this line of the new version.
 * @param {DiffFile[]} files
 * @param {string} path
 * @param {number} line
 */
export function isLineInDiff(files, path, line) {
  const file = files.find((candidate) => candidate.newPath === path);
  return file !== undefined && file.commentableLines.has(line);
}
