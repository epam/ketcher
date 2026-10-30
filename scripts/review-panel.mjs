#!/usr/bin/env node
// Picks the code-review lenses that apply to a diff: the review panel.
// /review-pr and the ketcher-flow review rounds both run it, so one diff
// always gets the same panel. Each lens's trigger is a list of path patterns
// and, for some lenses, a pattern over the lines the diff adds to source code.
// Owner doc: .agents/skills/code-review/SKILL.md (Panel).
//
// Usage:
//   node scripts/review-panel.mjs --pr <N> [--repo <owner/repo>]
//   node scripts/review-panel.mjs --base <ref>
//   git diff <ref>...HEAD | node scripts/review-panel.mjs

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SOURCE = /^packages\/[^/]+\/src\/.*\.(ts|tsx|js|jsx)$/;
const TEST = /(\/__tests__\/|\.test\.[jt]sx?$|\.spec\.[jt]sx?$)/;
const CODE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

/**
 * @typedef {{ path: string, added: string[] }} DiffFile
 * @typedef {{
 *   lens: string,
 *   paths?: RegExp[],
 *   sourcePaths?: RegExp[],
 *   addedInSource?: RegExp,
 *   anySource?: boolean,
 * }} Trigger
 */

/** @type {Trigger[]} Order is the order the panel lists the lenses in. */
export const TRIGGERS = [
  { lens: 'correctness', anySource: true },
  { lens: 'code-quality', paths: [CODE] },
  {
    lens: 'performance',
    paths: [
      /^packages\/[^/]+\/package\.json$/,
      /^packages\/[^/]+\/rollup\.config\.mjs$/,
    ],
    sourcePaths: [
      /^packages\/ketcher-core\/src\/application\/render\//,
      /^packages\/ketcher-core\/src\/application\/editor\/tools\//,
      /^packages\/ketcher-react\/src\/script\/editor\/tool\//,
      /^packages\/ketcher-macromolecules\/src\/.*\/render/i,
    ],
    addedInSource: /\bcloneDeep\b|\bindigo\b|structService/i,
  },
  {
    lens: 'security',
    sourcePaths: [
      /^packages\/ketcher-core\/src\/application\/formatters\//,
      /^packages\/ketcher-core\/src\/domain\/serializers\//,
      /^packages\/ketcher-core\/src\/utilities\/clipboardUtils\.ts$/,
      /^packages\/ketcher-standalone\/src\/infrastructure\/services\/struct\//,
    ],
    addedInSource:
      /innerHTML|outerHTML|insertAdjacentHTML|dangerouslySetInnerHTML|document\.write|\beval\(|new Function\b|postMessage|onmessage|addEventListener\(\s*['"]message/,
  },
  {
    lens: 'documentation-accuracy',
    paths: [
      /^packages\/[^/]+\/src\/index\.tsx?$/,
      /^packages\/ketcher-core\/src\/domain\/serializers\/ket\//,
      /^openspec\/specs\//,
      /^\.memory-bank\//,
      /(^|\/)README\.md$/,
    ],
  },
];

const isSource = (path) => SOURCE.test(path) && !TEST.test(path);

/**
 * Splits a unified diff into its files and the lines each one adds.
 * A renamed file takes its new path; a deleted file keeps its path.
 * @param {string} diff
 * @returns {DiffFile[]}
 */
export function parseDiff(diff) {
  const files = [];
  let current = null;
  let inHunk = false;
  for (const line of diff.split('\n')) {
    const header = line.match(/^diff --git a\/(.+) b\/(.+)$/);
    if (header) {
      current = { path: header[2], added: [] };
      files.push(current);
      inHunk = false;
    } else if (line.startsWith('@@')) {
      inHunk = true;
    } else if (current && inHunk && line.startsWith('+')) {
      current.added.push(line.slice(1));
    }
  }
  return files;
}

/**
 * The lenses whose trigger matches, each with the first file that matched.
 * @param {DiffFile[]} files
 * @returns {{ lens: string, because: string }[]}
 */
export function pickPanel(files) {
  const panel = [];
  for (const trigger of TRIGGERS) {
    const hit = files.find((file) => matches(trigger, file));
    if (hit) panel.push({ lens: trigger.lens, because: hit.path });
  }
  return panel;
}

function matches(trigger, file) {
  const source = isSource(file.path);
  if (trigger.anySource && source) return true;
  if (trigger.paths?.some((re) => re.test(file.path))) return true;
  if (!source) return false;
  if (trigger.sourcePaths?.some((re) => re.test(file.path))) return true;
  return Boolean(
    trigger.addedInSource &&
    file.added.some((line) => trigger.addedInSource.test(line)),
  );
}

function readDiff(args) {
  const pr = args.indexOf('--pr');
  if (pr !== -1) {
    const repo = args.indexOf('--repo');
    const repoArgs = repo === -1 ? [] : ['--repo', args[repo + 1]];
    return execFileSync('gh', ['pr', 'diff', args[pr + 1], ...repoArgs], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  }
  const base = args.indexOf('--base');
  if (base !== -1) {
    return execFileSync('git', ['diff', `${args[base + 1]}...HEAD`], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  }
  return readFileSync(0, 'utf8');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const panel = pickPanel(parseDiff(readDiff(process.argv.slice(2))));
  if (panel.length === 0) {
    console.log('No lens applies.');
  }
  for (const { lens, because } of panel) {
    console.log(`${lens}: ${because}`);
  }
}
