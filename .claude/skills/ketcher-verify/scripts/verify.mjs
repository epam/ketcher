#!/usr/bin/env node
/*
 * Runs the checks CI runs, restricted to the files changed in a Ketcher checkout, and prints a
 * compact summary. Full tool output goes to log files, so the caller reads only what failed.
 *
 *   node verify.mjs [--base <ref>] [--files <path>...] [--plan] [--build]
 *                   [--only <steps>] [--skip <steps>] [--lines <n>]
 *
 * Exit codes: 0 all checks passed (or nothing to check), 1 a check failed, 2 could not run,
 * 3 nothing failed but a check was blocked by a missing prerequisite.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STEPS = ['prettier', 'eslint', 'stylelint', 'tsc', 'jest', 'circ'];
const PRETTIER_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.json']);
const ESLINT_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);
const STYLE_EXT = new Set(['.less', '.css']);
const SOURCE_EXT = new Set(['.js', '.jsx', '.ts', '.tsx']);
const TYPED_EXT = new Set(['.ts', '.tsx']);
const TYPE_CONFIG = /(^|\/)(tsconfig[^/]*\.json|package\.json)$/;
// eslint.config.mjs ignores these globally, so linting them reports a vacuous pass.
const ESLINT_IGNORED = /(^|\/)(__tests__|testMocks)\/|\.(test|spec)\.[jt]sx?$|(^|\/)setupTests\.[jt]sx?$|\.d\.ts$/;
const NEVER_CHECKED = new Set(['package-lock.json']);
// Windows limits a command line to 32767 characters; file lists are split well below that.
const MAX_ARGS_LENGTH = 24000;
const KEPT_LOG_RUNS = 5;

const PACKAGES = ['ketcher-core', 'ketcher-react', 'ketcher-standalone', 'ketcher-macromolecules'];

// `tscNeeds`/`jestNeeds`: packages whose built `dist/index.d.ts` the step resolves through
// node_modules. `schema`: steps that type-check or load ketcher-core sources, which import the
// generated `compiledSchema.js`.
const WORKSPACES = [
  { dir: 'packages/ketcher-core', tscNeeds: [], jestNeeds: [], jest: true, circ: true, schema: ['tsc', 'jest'] },
  { dir: 'packages/ketcher-react', tscNeeds: [], jestNeeds: ['ketcher-core'], jest: true, circ: true, schema: ['tsc'] },
  { dir: 'packages/ketcher-macromolecules', tscNeeds: ['ketcher-core'], jestNeeds: ['ketcher-core'], jest: true },
  { dir: 'packages/ketcher-standalone', tscNeeds: ['ketcher-core'] },
  { dir: 'ketcher-autotests', tscNeeds: ['ketcher-core'] },
  { dir: 'example', tscNeeds: PACKAGES },
  { dir: 'demo', tscNeeds: PACKAGES },
  { dir: 'example-ssr', tscNeeds: PACKAGES, ownLintConfig: true },
];

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..', '..', '..', '..');
const SCHEMA_SOURCE = 'packages/ketcher-core/src/domain/serializers/ket/schema.json';
const SCHEMA_OUTPUT = 'packages/ketcher-core/src/domain/serializers/ket/compiledSchema.js';

class UsageError extends Error {}
class SetupError extends Error {}

const USAGE = `Usage: node verify.mjs [options]

Checks the files changed against HEAD (tracked and untracked) with the tools CI uses.

  --base <ref>        also include files changed by commits since <ref> (e.g. origin/master)
  --files <path>...   check exactly these files instead of the git changes
  --plan              print the commands without running them
  --build             build missing package dist folders before the checks that need them
  --only <steps>      comma-separated subset of: ${STEPS.join(', ')}
  --skip <steps>      comma-separated steps to leave out
  --lines <n>         output lines shown per failing check (default 30)
  -h, --help          show this help`;

const toPosix = (p) => p.split(path.sep).join('/');
const ext = (file) => path.extname(file).toLowerCase();
const stripAnsi = (text) => text.replace(/\[[0-9;]*[A-Za-z]/g, '');
const seconds = (ms) => `${(ms / 1000).toFixed(1)}s`;
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const fromRoot = (p) => toPosix(path.relative(ROOT, p)) || '.';

function compareText(a, b) {
  if (a < b) return -1;
  return a > b ? 1 : 0;
}

// ---------------------------------------------------------------------------------------------
// Arguments

function requireValue(argv, index, flag) {
  const value = argv[index];
  if (value === undefined || value.startsWith('--')) {
    throw new UsageError(`${flag} needs a value`);
  }
  return value;
}

function parseSteps(value, flag) {
  const steps = value.split(',').map((s) => s.trim()).filter(Boolean);
  if (!steps.length || steps.some((s) => !STEPS.includes(s))) {
    throw new UsageError(`${flag} accepts ${STEPS.join(', ')}; got "${value}"`);
  }
  return steps;
}

function parseLines(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) throw new UsageError('--lines needs a positive integer');
  return n;
}

function parseArgs(argv) {
  const opts = { base: null, files: null, plan: false, build: false, only: null, skip: new Set(), lines: 30, help: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--base') opts.base = requireValue(argv, ++i, arg);
    else if (arg === '--plan') opts.plan = true;
    else if (arg === '--build') opts.build = true;
    else if (arg === '--only') opts.only = new Set(parseSteps(requireValue(argv, ++i, arg), arg));
    else if (arg === '--skip') parseSteps(requireValue(argv, ++i, arg), arg).forEach((s) => opts.skip.add(s));
    else if (arg === '--lines') opts.lines = parseLines(requireValue(argv, ++i, arg));
    else if (arg === '-h' || arg === '--help') opts.help = true;
    else if (arg === '--files') {
      opts.files = [];
      while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) opts.files.push(argv[++i]);
      if (!opts.files.length) throw new UsageError('--files needs at least one path');
    } else throw new UsageError(`unknown argument: ${arg}`);
  }
  if (opts.files && opts.base) throw new UsageError('--files and --base cannot be combined');
  return opts;
}

// ---------------------------------------------------------------------------------------------
// Which files

function assertKetcherCheckout() {
  const manifest = path.join(ROOT, 'package.json');
  if (!fs.existsSync(manifest)) {
    throw new SetupError(`no package.json at ${ROOT}; the script must stay in .claude/skills/ketcher-verify/scripts`);
  }
  const json = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  if (json.name !== 'ketcher' || !Array.isArray(json.workspaces)) {
    throw new SetupError(`${ROOT} is not the Ketcher monorepo root`);
  }
}

function git(args) {
  const result = spawnSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw new SetupError(`git is not available: ${result.error.message}`);
  if (result.status !== 0) throw new SetupError(`git ${args.join(' ')} failed: ${result.stderr.trim()}`);
  return result.stdout.split('\0').filter(Boolean);
}

function explicitFiles(paths) {
  const files = new Set();
  for (const p of paths) {
    const found = [path.resolve(process.cwd(), p), path.resolve(ROOT, p)].find(
      (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    );
    if (!found) throw new UsageError(`not a file: ${p}`);
    const relative = path.relative(ROOT, found);
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new UsageError(`outside the Ketcher checkout: ${p}`);
    }
    files.add(toPosix(relative));
  }
  return [...files].sort(compareText);
}

function changedFiles(opts) {
  if (opts.files) return explicitFiles(opts.files);
  const files = new Set([
    ...git(['diff', '--name-only', '-z', '--diff-filter=d', 'HEAD']),
    ...git(['ls-files', '--others', '--exclude-standard', '-z']),
  ]);
  if (opts.base) {
    git(['diff', '--name-only', '-z', '--diff-filter=d', `${opts.base}...HEAD`]).forEach((f) => files.add(f));
  }
  return [...files].filter((f) => fs.existsSync(path.join(ROOT, f))).sort(compareText);
}

function describeSource(opts) {
  if (opts.files) return 'explicit files';
  if (opts.base) return `working tree and commits since ${opts.base}`;
  return 'working tree vs HEAD';
}

const workspaceOf = (file) => WORKSPACES.find((w) => file.startsWith(`${w.dir}/`)) ?? null;
const nameOf = (workspace) => path.posix.basename(workspace.dir);

function groupByWorkspace(files) {
  const groups = new Map();
  for (const file of files) {
    const workspace = workspaceOf(file);
    if (!workspace) continue;
    if (!groups.has(workspace)) groups.set(workspace, []);
    groups.get(workspace).push(file);
  }
  return groups;
}

// ---------------------------------------------------------------------------------------------
// What to run

function fileTasks(files, wanted) {
  const tasks = [];
  const idle = [];
  const add = (step, set, tool, args, exclude = () => false, note = '') => {
    if (!wanted(step)) return;
    const list = files.filter((f) => set.has(ext(f)) && !exclude(f));
    if (!list.length) {
      idle.push(note ? `${step} (${note})` : step);
      return;
    }
    const title = `${step} (${plural(list.length, 'file')}${note ? `, ${note}` : ''})`;
    tasks.push({ step, title, kind: 'node', tool, cwd: ROOT, args, files: list, needs: [], schema: false });
  };
  add('prettier', PRETTIER_EXT, ['prettier', 'prettier'], ['--check', '--log-level', 'warn']);
  const unlinted = files.filter((f) => ESLINT_EXT.has(ext(f)) && ESLINT_IGNORED.test(f)).length;
  add(
    'eslint',
    ESLINT_EXT,
    ['eslint', 'eslint'],
    ['--quiet', '--no-warn-ignored'],
    (f) => workspaceOf(f)?.ownLintConfig || ESLINT_IGNORED.test(f),
    unlinted ? `${unlinted} test file(s) not linted by eslint.config.mjs` : '',
  );
  add('stylelint', STYLE_EXT, ['stylelint', 'stylelint'], ['--allow-empty-input']);
  return { tasks, idle };
}

function tscTask(workspace, list, cwd) {
  const typed = list.some((f) => TYPED_EXT.has(ext(f)) || TYPE_CONFIG.test(f));
  if (!typed || !fs.existsSync(path.join(cwd, 'tsconfig.json'))) return null;
  return {
    step: 'tsc',
    title: `tsc ${nameOf(workspace)}`,
    kind: 'node',
    tool: ['typescript', 'tsc'],
    cwd,
    args: ['--noEmit', '--pretty', 'false'],
    files: [],
    needs: workspace.tscNeeds,
    schema: workspace.schema?.includes('tsc') ?? false,
  };
}

function jestTask(workspace, list, cwd) {
  const sources = list.filter((f) => SOURCE_EXT.has(ext(f)));
  if (!workspace.jest || !sources.length) return null;
  return {
    step: 'jest',
    title: `jest ${nameOf(workspace)} (related to ${plural(sources.length, 'file')})`,
    kind: 'node',
    tool: ['jest', 'jest'],
    cwd,
    args: ['--ci', '--passWithNoTests', '--findRelatedTests'],
    files: sources.map((f) => path.join(ROOT, f)),
    needs: workspace.jestNeeds,
    schema: workspace.schema?.includes('jest') ?? false,
  };
}

function circTask(workspace, list, cwd) {
  if (!workspace.circ || !list.some((f) => TYPED_EXT.has(ext(f)))) return null;
  return { step: 'circ', title: `circ ${nameOf(workspace)}`, kind: 'npm', cwd, args: ['run', 'test:circ', '--silent'], files: [], needs: [], schema: false };
}

function workspaceTasks(files, wanted) {
  const tasks = [];
  const builders = { tsc: tscTask, jest: jestTask, circ: circTask };
  for (const [workspace, list] of groupByWorkspace(files)) {
    const cwd = path.join(ROOT, workspace.dir);
    for (const [step, build] of Object.entries(builders)) {
      const task = wanted(step) ? build(workspace, list, cwd) : null;
      if (task) tasks.push(task);
    }
  }
  const idle = Object.keys(builders).filter((step) => wanted(step) && !tasks.some((t) => t.step === step));
  return { tasks, idle };
}

function buildPlan(files, opts) {
  const wanted = (step) => (!opts.only || opts.only.has(step)) && !opts.skip.has(step);
  const checked = files.filter((f) => !NEVER_CHECKED.has(path.posix.basename(f)));
  const perFile = fileTasks(checked, wanted);
  const perWorkspace = workspaceTasks(checked, wanted);
  return { tasks: [...perFile.tasks, ...perWorkspace.tasks], idle: [...perFile.idle, ...perWorkspace.idle] };
}

function describeTask(task) {
  const tool = task.kind === 'npm' ? 'npm' : `${task.tool[0]}/${task.tool[1]}`;
  const shown = task.files.slice(0, 5).map((f) => (path.isAbsolute(f) ? fromRoot(f) : f));
  const more = task.files.length > 5 ? ` …(+${task.files.length - 5})` : '';
  const files = shown.length ? ` ${shown.join(' ')}${more}` : '';
  const needs = task.needs.length ? `  [needs dist: ${task.needs.join(', ')}]` : '';
  const schema = task.schema ? '  [needs the compiled KET schema]' : '';
  return `PLAN  ${task.title}: [${fromRoot(task.cwd)}] ${tool} ${task.args.join(' ')}${files}${needs}${schema}`;
}

// ---------------------------------------------------------------------------------------------
// Running

// Mirrors Node's lookup for a workspace: the package's own node_modules first, then each parent up to
// the repository root — never above it, so a stray node_modules outside the checkout is not used.
function resolveBin(pkg, command, fromDir) {
  let dir = path.resolve(fromDir);
  for (;;) {
    const manifest = path.join(dir, 'node_modules', pkg, 'package.json');
    if (fs.existsSync(manifest)) {
      const { bin } = JSON.parse(fs.readFileSync(manifest, 'utf8'));
      const relative = typeof bin === 'string' ? bin : bin?.[command];
      if (!relative) throw new SetupError(`${pkg} declares no "${command}" executable`);
      return path.join(path.dirname(manifest), relative);
    }
    const parent = path.dirname(dir);
    if (dir === ROOT || parent === dir) return null;
    dir = parent;
  }
}

function spawnTool(task, args, log) {
  const env = { ...process.env, FORCE_COLOR: '0', NO_COLOR: '1' };
  const options = { cwd: task.cwd, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, env };
  // npm is a .cmd shim on Windows and needs a shell. Its arguments are fixed strings from this
  // script, never file names, so they are joined into one command line rather than passed as an
  // array together with `shell: true`, which Node deprecates (DEP0190).
  const result =
    task.kind === 'npm'
      ? spawnSync(['npm', ...args].join(' '), { ...options, shell: true })
      : spawnSync(process.execPath, [task.binPath, ...args], options);
  const output = result.error ? `could not start: ${result.error.message}\n` : `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const command = task.kind === 'npm' ? 'npm' : path.basename(task.binPath);
  log.push(`$ ${command} ${args.join(' ')}\n${output}\n`);
  return { ok: !result.error && result.status === 0, output };
}

function pickLines(step, lines) {
  if (step === 'jest') return lines.filter((l) => /^(FAIL |\s*● |Tests:|Test Suites:)/.test(l));
  if (step === 'prettier') return lines.filter((l) => /^\[(warn|error)\]/.test(l));
  if (step === 'tsc') {
    const errors = lines.filter((l) => /error TS\d+/.test(l));
    return errors.length ? [...errors, `${errors.length} type error(s)`] : [];
  }
  return [];
}

function excerpt(step, output, limit) {
  const lines = stripAnsi(output).split(/\r?\n/).filter((l) => l.trim() !== '');
  let picked = pickLines(step, lines);
  if (!picked.length) {
    // Tools that end with a summary (jest crashes, dpdm, npm scripts) are read from the bottom.
    picked = ['circ', 'jest', 'prep'].includes(step) ? lines.slice(-limit) : lines;
  }
  const shown = picked.slice(0, limit);
  if (picked.length > limit) shown.push(`... ${picked.length - limit} more line(s) in the log`);
  return shown;
}

function prepareLogDir() {
  const base = path.join(os.tmpdir(), 'ketcher-verify');
  fs.mkdirSync(base, { recursive: true });
  const runs = fs.readdirSync(base).filter((d) => /^\d{8}-\d{6}/.test(d)).sort(compareText);
  for (const old of runs.slice(0, Math.max(0, runs.length - (KEPT_LOG_RUNS - 1)))) {
    fs.rmSync(path.join(base, old), { recursive: true, force: true });
  }
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace('T', '-').slice(0, 15);
  const dir = path.join(base, `${stamp}-${process.pid}`);
  fs.mkdirSync(dir);
  return dir;
}

function nodeVersionWarning() {
  const nvmrc = path.join(ROOT, '.nvmrc');
  if (!fs.existsSync(nvmrc)) return null;
  const wanted = fs.readFileSync(nvmrc, 'utf8').trim().replace(/^v/, '');
  const parse = (v) => v.split('.').map((n) => Number.parseInt(n, 10) || 0);
  const current = parse(process.versions.node);
  const required = parse(wanted);
  const index = [0, 1, 2].find((i) => current[i] !== required[i]);
  if (index === undefined || current[index] > required[index]) return null;
  return `Node v${process.versions.node} is older than .nvmrc ${wanted}`;
}

function schemaIsStale() {
  const output = path.join(ROOT, SCHEMA_OUTPUT);
  if (!fs.existsSync(output)) return true;
  return fs.statSync(output).mtimeMs < fs.statSync(path.join(ROOT, SCHEMA_SOURCE)).mtimeMs;
}

function runPrep(title, args, logDir, lines) {
  const log = [];
  const started = Date.now();
  const { ok, output } = spawnTool({ kind: 'npm', cwd: ROOT }, args, log);
  const file = path.join(logDir, `prep-${title.replace(/\W+/g, '-')}.log`);
  fs.writeFileSync(file, log.join('\n'));
  const status = ok ? 'ok' : 'FAILED';
  const where = ok ? '' : `  log: ${file}`;
  console.log(`PREP  ${title} ${status}  ${seconds(Date.now() - started)}${where}`);
  if (!ok) excerpt('prep', output, lines).forEach((l) => console.log(`      ${l}`));
  return ok;
}

const buildScriptFor = (pkg) => (pkg === 'ketcher-core' ? 'build:core' : 'build:packages');
const distReady = (pkg) => fs.existsSync(path.join(ROOT, 'packages', pkg, 'dist', 'index.d.ts'));

// Returns the reasons a task cannot run, keyed by the prerequisite: a package name or 'schema'.
function preparePrerequisites(tasks, opts, logDir) {
  const blocked = new Map();
  const missing = [...new Set(tasks.flatMap((t) => t.needs))].filter((pkg) => !distReady(pkg));
  if (missing.length && opts.build) {
    const script = missing.length === 1 ? buildScriptFor(missing[0]) : 'build:packages';
    runPrep(script, ['run', script], logDir, opts.lines);
  }
  for (const pkg of missing.filter((p) => !distReady(p))) {
    blocked.set(pkg, `needs packages/${pkg}/dist — run \`npm run ${buildScriptFor(pkg)}\` or pass --build`);
  }
  const needsSchema = tasks.some((t) => t.schema) && schemaIsStale();
  if (needsSchema && !runPrep('KET schema (npm run ajv)', ['run', 'ajv', '-w', 'ketcher-core'], logDir, opts.lines)) {
    blocked.set('schema', `needs ${SCHEMA_OUTPUT} — \`npm run ajv -w ketcher-core\` failed`);
  }
  return blocked;
}

function chunks(items) {
  const result = [];
  let current = [];
  let length = 0;
  for (const item of items) {
    if (current.length && length + item.length + 3 > MAX_ARGS_LENGTH) {
      result.push(current);
      current = [];
      length = 0;
    }
    current.push(item);
    length += item.length + 3;
  }
  if (current.length) result.push(current);
  return result;
}

function blockReason(task, blocked) {
  const keys = task.schema ? [...task.needs, 'schema'] : task.needs;
  const reason = keys.map((k) => blocked.get(k)).find(Boolean);
  if (reason) return reason;
  if (task.kind !== 'node') return null;
  task.binPath = resolveBin(task.tool[0], task.tool[1], task.cwd);
  return task.binPath ? null : `${task.tool[0]} is not installed for ${fromRoot(task.cwd)}`;
}

function executeTask(task, blocked, logDir, lines) {
  const reason = blockReason(task, blocked);
  if (reason) {
    console.log(`BLOCK ${task.title} — ${reason}`);
    return 'block';
  }
  const log = [];
  const started = Date.now();
  let ok = true;
  let output = '';
  const parts = task.files.length ? chunks(task.files) : [[]];
  for (const part of parts) {
    const result = spawnTool(task, [...task.args, ...part], log);
    ok = ok && result.ok;
    output += result.output;
  }
  const logFile = path.join(logDir, `${task.title.split(' (')[0].replace(/\W+/g, '-')}.log`);
  fs.writeFileSync(logFile, log.join('\n'));
  const time = seconds(Date.now() - started);
  if (ok) {
    console.log(`PASS  ${task.title}  ${time}`);
    return 'pass';
  }
  console.log(`FAIL  ${task.title}  ${time}  log: ${logFile}`);
  excerpt(task.step, output, lines).forEach((l) => console.log(`      ${l}`));
  return 'fail';
}

function printHeader(files, opts) {
  const counts = new Map();
  for (const file of files) {
    const key = workspaceOf(file)?.dir ?? 'other';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const groups = [...counts].map(([key, n]) => `${key} (${n})`).join(', ');
  console.log(`ketcher-verify: ${plural(files.length, 'changed file')} (${describeSource(opts)})`);
  console.log(`  ${groups}`);
}

function run() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log(USAGE);
    return 0;
  }
  assertKetcherCheckout();
  const files = changedFiles(opts);
  if (!files.length) {
    console.log(`ketcher-verify: nothing to check (${describeSource(opts)}). Pass --files <paths> or --base <ref>.`);
    return 0;
  }
  printHeader(files, opts);
  const { tasks, idle } = buildPlan(files, opts);
  const idleLine = idle.length ? `SKIP  ${idle.join(', ')} — nothing to check` : null;
  if (opts.plan || !tasks.length) {
    if (opts.plan) tasks.forEach((task) => console.log(describeTask(task)));
    if (idleLine) console.log(idleLine);
    return 0;
  }
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) {
    throw new SetupError('dependencies are not installed: run `npm ci` at the repository root (Node from .nvmrc)');
  }
  const warning = nodeVersionWarning();
  if (warning) console.log(`WARN  ${warning}`);

  const logDir = prepareLogDir();
  const blocked = preparePrerequisites(tasks, opts, logDir);
  const counts = { pass: 0, fail: 0, block: 0 };
  for (const task of tasks) counts[executeTask(task, blocked, logDir, opts.lines)]++;
  if (idleLine) console.log(idleLine);
  console.log(`Result: ${counts.fail} failed, ${counts.block} blocked, ${counts.pass} passed. Logs: ${logDir}`);
  if (counts.fail) return 1;
  return counts.block ? 3 : 0;
}

try {
  process.exitCode = run();
} catch (error) {
  if (error instanceof UsageError) {
    console.error(`ketcher-verify: ${error.message}\n\n${USAGE}`);
  } else if (error instanceof SetupError) {
    console.error(`ketcher-verify: ${error.message}`);
  } else {
    console.error(`ketcher-verify: unexpected failure: ${error.stack ?? error}`);
  }
  process.exitCode = 2;
}
