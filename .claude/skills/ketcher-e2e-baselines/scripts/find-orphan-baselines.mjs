#!/usr/bin/env node
/*
 * Finds committed Playwright baselines that no longer belong to anything: a `-snapshots` folder whose
 * spec was deleted or renamed, a baseline whose project suffix contradicts the spec's project, and
 * platform baselines that should never be tracked. Renaming a test also orphans its PNG, and nothing
 * in the repository reports that.
 *
 *   node find-orphan-baselines.mjs [--limit <n>] [--quiet]
 *
 * Reads the git index, not the working tree, so it is correct under a sparse checkout that leaves the
 * PNGs on the server. Exit codes: 0 nothing orphaned, 1 something orphaned, 2 could not run.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..', '..');
const SPECS = 'ketcher-autotests/tests/specs';
const POPUP_SEGMENT = '/Chromium-popup/';
const USAGE = 'Usage: node find-orphan-baselines.mjs [--limit <n>] [--quiet]';

function parseArgs(argv) {
  const opts = { limit: 20, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--limit') {
      const n = Number(argv[++i]);
      if (!Number.isInteger(n) || n < 1) throw new Error('--limit needs a positive integer');
      opts.limit = n;
    } else if (argv[i] === '--quiet') opts.quiet = true;
    else if (argv[i] === '-h' || argv[i] === '--help') opts.help = true;
    else throw new Error(`unknown argument: ${argv[i]}`);
  }
  return opts;
}

function gitFiles(pathspec) {
  const out = execFileSync('git', ['-C', ROOT, 'ls-files', '-z', '--', pathspec], {
    encoding: 'utf8',
    maxBuffer: 256 * 1024 * 1024,
  });
  return out.split('\0').filter(Boolean);
}

function report(title, items, opts) {
  if (!items.length) return 0;
  console.log(`${title}: ${items.length}`);
  if (!opts.quiet) {
    items.slice(0, opts.limit).forEach((item) => console.log(`  ${item}`));
    if (items.length > opts.limit) console.log(`  … ${items.length - opts.limit} more (raise --limit)`);
  }
  return items.length;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  if (!fs.existsSync(path.join(ROOT, SPECS))) {
    console.error(`find-orphan-baselines: ${SPECS} not found under ${ROOT}`);
    return 2;
  }

  const tracked = gitFiles(`${SPECS}/**`);
  const specs = new Set(tracked.filter((f) => f.endsWith('.spec.ts')));
  const baselines = tracked.filter((f) => f.includes('.spec.ts-snapshots/'));

  const orphanDirs = new Map();
  const wrongProject = [];
  const wrongPlatform = [];
  for (const file of baselines) {
    const owningSpec = `${file.split('.spec.ts-snapshots/')[0]}.spec.ts`;
    if (!specs.has(owningSpec)) {
      const dir = `${owningSpec}-snapshots`;
      orphanDirs.set(dir, (orphanDirs.get(dir) ?? 0) + 1);
      continue;
    }
    const inPopupProject = owningSpec.includes(POPUP_SEGMENT);
    if (file.endsWith('-chromium-popup-linux.png') !== inPopupProject) {
      wrongProject.push(`${file} (spec runs in project ${inPopupProject ? 'chromium-popup' : 'chromium'})`);
    }
    if (/-(win32|darwin)\.png$/.test(file)) wrongPlatform.push(file);
  }

  const orphanList = [...orphanDirs].map(([dir, count]) => `${dir} (${count} file(s))`).sort();
  console.log(`Baselines: ${baselines.length} tracked for ${specs.size} spec files`);
  let problems = 0;
  problems += report('Snapshot folders whose spec no longer exists', orphanList, opts);
  problems += report('Baselines whose project suffix contradicts the spec location', wrongProject, opts);
  problems += report('Platform baselines that must not be tracked', wrongPlatform, opts);
  if (!problems) {
    console.log('No orphaned baselines.');
    return 0;
  }
  console.log('Delete only what the owning change accounts for; a rename needs a regenerated baseline, not a deletion.');
  return 1;
}

try {
  process.exitCode = main();
} catch (error) {
  console.error(`find-orphan-baselines: ${error.message}\n${USAGE}`);
  process.exitCode = 2;
}
