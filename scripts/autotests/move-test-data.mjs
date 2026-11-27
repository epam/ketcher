#!/usr/bin/env node
// Keeps every test-data file of a new autotest spec in the folder of its
// feature: tests/test-data/<Format>/Chromium-popup/<spec name>/ for popup
// specs, tests/test-data/<Format>/<spec name>/ for full-scale specs.
// The Claude Implement Autotests workflow runs it after Claude writes the spec.
// A file from another folder is copied into the feature folder; a path to a
// file that does not exist yet (an expected file) only gets the new folder.
// The spec is rewritten to use the new paths.
//
// Usage:
//   node scripts/autotests/move-test-data.mjs <spec file name> [--root <repo root>]
// Prints a markdown report for the PR body: the copied files, and the paths
// built from variables that it cannot check (empty when there is nothing).

import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { basename, dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SPECS_DIR = 'ketcher-autotests/tests/specs';
export const TEST_DATA_DIR = 'ketcher-autotests/tests/test-data';
const POPUP_DIR = 'Chromium-popup';
const SPEC_SUFFIX = '.spec.ts';

/** File extensions of test-data files that the spec can reference. */
export const DATA_EXTENSIONS = [
  'ket',
  'mol',
  'rxn',
  'sdf',
  'rdf',
  'cdx',
  'cdxml',
  'cml',
  'smi',
  'smiles',
  'cxsmi',
  'cxsmiles',
  'smarts',
  'inchi',
  'idt',
  'seq',
  'fasta',
  'helm',
  'json',
  'txt',
  'png',
  'svg',
  'pptx',
  'zip',
];

const EXTENSION = `\\.(?:${DATA_EXTENSIONS.join('|')})`;

// One pattern per quote kind, so a path in double quotes can contain an
// apostrophe (some test-data file names do).
const LITERAL = new RegExp(
  [
    `'([^'\\n]+?${EXTENSION})'`,
    `"([^"\\n]+?${EXTENSION})"`,
    `\`([^\`$\\n]+?${EXTENSION})\``,
  ].join('|'),
  'gi',
);

// A template literal that builds a data path from variables.
const DYNAMIC = new RegExp(`\`([^\`\\n]*\\$\\{[^\`\\n]*${EXTENSION})\``, 'gi');

/**
 * @typedef {{ from: string, to: string, copied: boolean }} Move
 */

/**
 * Finds the spec file with the given name under the specs folder.
 * @param {string} root Repository root.
 * @param {string} specFileName For example `5359-Display-molecules.spec.ts`.
 * @returns {string | null} Path relative to the root, or null when not found.
 */
export function findSpec(root, specFileName) {
  const matches = listFiles(join(root, SPECS_DIR)).filter(
    (file) => basename(file) === specFileName,
  );
  if (matches.length === 0) {
    return null;
  }
  return posix.join(SPECS_DIR, toPosix(matches[0]));
}

/**
 * Lists every file under a folder, as paths relative to it.
 * @param {string} folder Absolute folder path.
 * @returns {string[]}
 */
function listFiles(folder) {
  if (!existsSync(folder)) {
    return [];
  }
  return readdirSync(folder, { recursive: true }).filter((entry) =>
    statSync(join(folder, entry)).isFile(),
  );
}

/**
 * Converts a path to forward slashes.
 * @param {string} path
 * @returns {string}
 */
function toPosix(path) {
  return path.split('\\').join('/');
}

/**
 * Tells whether the spec runs in the Chromium popup project.
 * @param {string} specPath Spec path relative to the repository root.
 * @returns {boolean}
 */
export function isPopupSpec(specPath) {
  return specPath.split('/').includes(POPUP_DIR);
}

/**
 * Returns the folder that a test-data path of this format must be in.
 * @param {string} format First folder of the path, such as `KET`.
 * @param {string} featureName Spec file name without `.spec.ts`.
 * @param {boolean} popup Whether the spec is a popup spec.
 * @returns {string} Folder relative to tests/test-data.
 */
export function featureFolder(format, featureName, popup) {
  if (popup) {
    return posix.join(format, POPUP_DIR, featureName);
  }
  return posix.join(format, featureName);
}

/**
 * Finds the test-data paths in the spec text: string literals that end with a
 * data extension and whose first folder exists under tests/test-data.
 * @param {string} specText
 * @param {string[]} formats Folder names directly under tests/test-data.
 * @returns {string[]} Unique paths, in the order they appear.
 */
export function findDataPaths(specText, formats) {
  const paths = [];
  for (const match of specText.matchAll(LITERAL)) {
    const path = literalPath(match);
    if (formats.includes(path.split('/')[0]) && !paths.includes(path)) {
      paths.push(path);
    }
  }
  return paths;
}

/**
 * Returns the path inside a LITERAL match, whatever its quote kind.
 * @param {RegExpMatchArray | string[]} match
 * @returns {string}
 */
function literalPath(match) {
  return match[1] || match[2] || match[3];
}

/**
 * Finds the template literals that build a test-data path from variables.
 * The script cannot move these, so it reports them.
 * @param {string} specText
 * @returns {string[]} Unique literals without the backticks.
 */
export function findDynamicPaths(specText) {
  const paths = [];
  for (const match of specText.matchAll(DYNAMIC)) {
    if (!paths.includes(match[1])) {
      paths.push(match[1]);
    }
  }
  return paths;
}

/**
 * Picks a free target path: the same name, or a numbered one when another
 * file already has that name.
 * @param {string} dataRoot Absolute tests/test-data path.
 * @param {string} folder Target folder relative to tests/test-data.
 * @param {string} source Absolute path of the file to copy.
 * @returns {string} Target path relative to tests/test-data.
 */
function freeTarget(dataRoot, folder, source) {
  const name = posix.basename(toPosix(source));
  const dot = name.lastIndexOf('.');
  for (let index = 1; ; index += 1) {
    const candidateName =
      index === 1 ? name : `${name.slice(0, dot)}-${index}${name.slice(dot)}`;
    const candidate = posix.join(folder, candidateName);
    const absolute = join(dataRoot, candidate);
    if (!existsSync(absolute) || sameContent(absolute, source)) {
      return candidate;
    }
  }
}

/**
 * Tells whether two files have the same bytes.
 * @param {string} first
 * @param {string} second
 * @returns {boolean}
 */
function sameContent(first, second) {
  return readFileSync(first).equals(readFileSync(second));
}

/**
 * Plans and applies the move of one path: copies an existing file into the
 * feature folder, or only changes the folder of a file that does not exist.
 * @param {string} dataRoot Absolute tests/test-data path.
 * @param {string} path Path from the spec, relative to tests/test-data.
 * @param {string} folder Feature folder for its format.
 * @returns {Move | null} Null when the path is already in the feature folder.
 */
function movePath(dataRoot, path, folder) {
  if (path.startsWith(`${folder}/`)) {
    return null;
  }
  const source = join(dataRoot, path);
  if (!existsSync(source)) {
    return {
      from: path,
      to: posix.join(folder, posix.basename(path)),
      copied: false,
    };
  }
  const to = freeTarget(dataRoot, folder, source);
  const target = join(dataRoot, to);
  if (!existsSync(target)) {
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(source, target);
  }
  return { from: path, to, copied: true };
}

/**
 * Moves every test-data path of the spec into the feature folder and
 * rewrites the spec.
 * @param {string} root Repository root.
 * @param {string} specPath Spec path relative to the root.
 * @returns {Move[]}
 */
export function moveTestData(root, specPath) {
  const dataRoot = join(root, TEST_DATA_DIR);
  const formats = readdirSync(dataRoot).filter((entry) =>
    statSync(join(dataRoot, entry)).isDirectory(),
  );
  const specFile = join(root, specPath);
  const featureName = posix.basename(specPath, SPEC_SUFFIX);
  const popup = isPopupSpec(specPath);
  let specText = readFileSync(specFile, 'utf8');
  const moves = [];
  for (const path of findDataPaths(specText, formats)) {
    const folder = featureFolder(path.split('/')[0], featureName, popup);
    const move = movePath(dataRoot, path, folder);
    if (move) {
      moves.push(move);
      specText = replaceLiteral(specText, move.from, move.to);
    }
  }
  writeFileSync(specFile, specText);
  return moves;
}

/**
 * Replaces a path inside every string literal that holds exactly that path.
 * @param {string} text
 * @param {string} from
 * @param {string} to
 * @returns {string}
 */
function replaceLiteral(text, from, to) {
  return text.replace(LITERAL, (literal, ...groups) => {
    if (literalPath([literal, ...groups]) === from) {
      return `${literal[0]}${to}${literal[0]}`;
    }
    return literal;
  });
}

/**
 * Formats the report for the PR body: the copied files, and the paths the
 * script could not check because the spec builds them from variables.
 * @param {Move[]} moves
 * @param {string[]} dynamicPaths
 * @returns {string} Empty when there is nothing to report.
 */
export function formatReport(moves, dynamicPaths) {
  const sections = [];
  const copied = moves.filter((move) => move.copied);
  if (copied.length > 0) {
    sections.push(
      [
        'Test data copied into the feature folder:',
        ...copied.map((move) => `- \`${move.from}\` → \`${move.to}\``),
      ].join('\n'),
    );
  }
  if (dynamicPaths.length > 0) {
    sections.push(
      [
        'Check by hand that these paths are in the feature folder (the spec builds them from variables):',
        ...dynamicPaths.map((path) => `- \`${path}\``),
      ].join('\n'),
    );
  }
  return sections.join('\n\n');
}

/**
 * Reads the command-line arguments.
 * @param {string[]} args
 * @returns {{ specFileName: string | null, root: string }}
 */
function parseArgs(args) {
  const rest = [...args];
  let root = process.cwd();
  const rootIndex = rest.indexOf('--root');
  if (rootIndex !== -1) {
    root = rest[rootIndex + 1];
    rest.splice(rootIndex, 2);
  }
  return { specFileName: rest[0] || null, root };
}

/**
 * Runs the script.
 * @param {string[]} args
 */
function main(args) {
  const { specFileName, root } = parseArgs(args);
  if (!specFileName) {
    console.error(
      'Usage: move-test-data.mjs <spec file name> [--root <repo root>]',
    );
    process.exit(2);
  }
  const specPath = findSpec(root, specFileName);
  if (!specPath) {
    console.error(`Spec file not found under ${SPECS_DIR}: ${specFileName}`);
    process.exit(1);
  }
  const moves = moveTestData(root, specPath);
  for (const move of moves) {
    console.error(
      `${move.copied ? 'copied' : 'renamed'}: ${move.from} -> ${move.to}`,
    );
  }
  const specText = readFileSync(join(root, specPath), 'utf8');
  process.stdout.write(formatReport(moves, findDynamicPaths(specText)));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main(process.argv.slice(2));
}
