#!/usr/bin/env node
/*
 * Verifies symbol anchors in the Ketcher knowledge base and assistant configuration. An anchor is an
 * inline code span `path/from/repo/root.ext#Symbol`: the file must exist and contain the literal
 * after '#'. Paths starting with ../ point into sibling checkouts (e.g. ../indigo/...).
 *
 *   node check-anchors.mjs [--strict] [extra files or directories...]
 *
 * Scans CLAUDE.md, AGENTS.md, .memory-bank/ and .claude/ of the checkout, plus the extra paths given
 * (resolved from the current directory; their anchors still resolve against the checkout root).
 * Legacy line anchors (`file.ts:123`) are reported as warnings, or as failures with --strict.
 *
 * Exit codes: 0 every anchor resolves, 1 an anchor does not resolve, 2 usage error.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..', '..');
const DEFAULT_TARGETS = ['CLAUDE.md', 'AGENTS.md', '.memory-bank', '.claude'];
const ANCHOR = /`([^`\s#]+\.[A-Za-z0-9]+)#([^`]+)`/g;
const LINE_ANCHOR = /`([^`\s#]+\.(?:ts|tsx|js|jsx|mjs|cjs|json|less|md|ya?ml|cpp|h|py)):(\d+)(?:[-–]\d+)?\+?`/g;
const USAGE = 'Usage: node check-anchors.mjs [--strict] [extra files or directories...]';

function markdownFiles(target) {
  if (!fs.existsSync(target)) return [];
  if (fs.statSync(target).isFile()) return target.endsWith('.md') ? [target] : [];
  return fs
    .readdirSync(target, { withFileTypes: true })
    .filter((entry) => entry.name !== 'node_modules' && !entry.name.startsWith('.git'))
    .flatMap((entry) => markdownFiles(path.join(target, entry.name)));
}

function parseArgs(argv) {
  const opts = { strict: false, extra: [] };
  for (const arg of argv) {
    if (arg === '--strict') opts.strict = true;
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg.startsWith('--')) throw new Error(`unknown option: ${arg}`);
    else {
      const target = path.resolve(process.cwd(), arg);
      if (!fs.existsSync(target)) throw new Error(`no such file or directory: ${arg}`);
      opts.extra.push(target);
    }
  }
  return opts;
}

function createResolver() {
  const cache = new Map();
  return (relative) => {
    if (!cache.has(relative)) {
      const file = path.resolve(ROOT, relative);
      cache.set(relative, fs.existsSync(file) && fs.statSync(file).isFile() ? fs.readFileSync(file, 'utf8') : null);
    }
    return cache.get(relative);
  };
}

function checkDocument(doc, read) {
  const failures = [];
  const legacy = [];
  let anchors = 0;
  const lines = fs.readFileSync(doc, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const [, file, symbol] of line.matchAll(ANCHOR)) {
      anchors++;
      const content = read(file);
      if (content === null) failures.push({ index, text: `${file}#${symbol}`, reason: 'file not found' });
      else if (!content.includes(symbol)) failures.push({ index, text: `${file}#${symbol}`, reason: 'symbol not found in the file' });
    }
    for (const [match] of line.matchAll(LINE_ANCHOR)) legacy.push({ index, text: match.slice(1, -1) });
  });
  return { anchors, failures, legacy };
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(`check-anchors: ${error.message}\n${USAGE}`);
    return 2;
  }
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  const documents = [...new Set([...DEFAULT_TARGETS.map((t) => path.join(ROOT, t)), ...opts.extra].flatMap(markdownFiles))];
  const read = createResolver();
  let total = 0;
  let failed = 0;
  let legacyCount = 0;
  for (const doc of documents) {
    const { anchors, failures, legacy } = checkDocument(doc, read);
    const shown = path.relative(process.cwd(), doc) || doc;
    total += anchors;
    failed += failures.length;
    legacyCount += legacy.length;
    failures.forEach((f) => console.log(`FAIL  ${shown}:${f.index + 1}  \`${f.text}\` — ${f.reason}`));
    legacy.forEach((l) => console.log(`${opts.strict ? 'FAIL' : 'WARN'}  ${shown}:${l.index + 1}  \`${l.text}\` — line-number anchor; use path#Symbol`));
  }
  const legacyNote = legacyCount ? `, ${legacyCount} line-number anchor(s)` : '';
  if (failed) {
    console.log(`${failed} of ${total} anchors in ${documents.length} files do not resolve${legacyNote}`);
    return 1;
  }
  console.log(`all ${total} anchors in ${documents.length} files resolve${legacyNote}`);
  return opts.strict && legacyCount ? 1 : 0;
}

process.exitCode = main();
