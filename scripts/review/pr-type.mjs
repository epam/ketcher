// The PR type for the brief, by the PR-type contract in
// .memory-bank/review-workflow.md. Only the rows that the linked issue and
// the file list decide are derived here. Refactor and small change depend on
// whether behavior changes, which no file list shows, so the brief then says
// that no row matches. Pure: data in, a name out.

import { LSC_LABEL } from '../pr-checks.mjs';
import { filePath } from './diff.mjs';

/** @typedef {import('./diff.mjs').DiffFile} DiffFile */

const OPENSPEC_ARCHIVE = /^openspec\/changes\/archive\//;
const OPENSPEC_CHANGE = /^openspec\/changes\/[^/]+\//;

/** @param {DiffFile} file */
const isArchiveMove = (file) =>
  file.status === 'renamed' && OPENSPEC_ARCHIVE.test(filePath(file));

/** @param {DiffFile} file */
const isNewChange = (file) =>
  file.status === 'added' &&
  OPENSPEC_CHANGE.test(filePath(file)) &&
  !OPENSPEC_ARCHIVE.test(filePath(file));

/**
 * The row of the contract, or undefined. A linked Bug wins, since the issue
 * says it; then a new OpenSpec change, then a move into the archive.
 * @param {{ number: number, type: string | null }[]} linkedIssues
 * @param {DiffFile[]} files every file of the pull request diff
 */
function contractRow(linkedIssues, files) {
  if (linkedIssues.some((issue) => issue.type === 'Bug')) {
    return 'bug fix';
  }
  if (files.some(isNewChange)) {
    return 'feature';
  }
  if (files.some(isArchiveMove)) {
    return 'archive of an OpenSpec change';
  }
  return undefined;
}

/**
 * The PR type, or undefined when no row matches. A large-scale change also
 * has one of the other types, so the label adds to the row.
 * @param {object} pr
 * @param {{ number: number, type: string | null }[]} pr.linkedIssues
 * @param {DiffFile[]} pr.files every file of the pull request diff
 * @param {string[]} pr.labels
 */
export function prType({ linkedIssues, files, labels }) {
  const row = contractRow(linkedIssues, files);
  if (!labels.includes(LSC_LABEL)) {
    return row;
  }
  if (!row) {
    return 'large-scale change';
  }
  return `${row}, large-scale change`;
}