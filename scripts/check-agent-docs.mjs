#!/usr/bin/env node
// Checks that the agent instructions agree with each other and with the repo.
// Run with `npm run check:agent-docs`. Exit 0 when every check passes, 1 when
// a check finds a problem, 2 when the check cannot run.
//
// Each check is one entry in CHECKS: { id, run(repo, parsed) -> Finding[] }.
// `repo` is the disk adapter below, or an in-memory stand-in in tests.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, matchesGlob, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { formatFinding, sortFindings } from './agent-docs/findings.mjs';
import {
  agentDocPaths,
  docPaths,
  globToRegExp,
  isCheckedRef,
  pathIndex,
  pathRefs,
  refResolves,
  topLevelNames,
} from './agent-docs/paths.mjs';
import {
  INSTRUCTIONS_DIR,
  RULE_FILE,
  parseRules,
  renderInstructions,
} from './agent-docs/rules.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_FILE = 'scripts/check-agent-docs.mjs';

// Data tables. Edit these when a doc set or a conflict pattern changes.

// Flows a user starts to review each commit (the /commit skill, release
// commits). Their ask-before-commit steps are not a conflict source.
const USER_REVIEWED_COMMIT_FLOWS = [
  '.agents/skills/commit/SKILL.md',
  '.agents/skills/prepare-release/SKILL.md',
];

// Each conflict lists two sides. A match on the second side in one file that
// has a match on the first side in another file is reported on the second.
const CONFLICTS = [
  {
    id: 'commit-policy',
    fix: 'make the agent files agree with AGENTS.md "Git and commits"',
    sides: [
      {
        name: 'commit without asking',
        pattern: /\bcommit\b[^.\n]*\bwithout asking\b/i,
      },
      {
        name: 'ask before commit',
        pattern:
          /\bask\b[^.\n]*\bbefore (?:you )?commit(?:ting)?\b|\bcommit only after\b/i,
        exempt: USER_REVIEWED_COMMIT_FLOWS,
      },
    ],
  },
  {
    id: 'e2e-selectors',
    fix: 'make the agent files agree with .memory-bank/testing/testing.md "Selector Order"',
    sides: [
      {
        name: 'getByTestId only in page objects',
        pattern: /\bgetByTestId\b[^.\n]*\bonly\b[^.\n]*\bpage objects?\b/i,
      },
      {
        name: 'raw page.getByTestId in specs',
        pattern: /\b(?:write|use|call)\b[^.\n]*\bpage\.getByTestId\(/i,
      },
    ],
  },
];

const LINT_ERROR_LEVELS = [2, 'error'];

// Checks

const rulesGrammar = {
  id: 'rules-grammar',
  run(repo, parsed) {
    if (repo.read(RULE_FILE) === null) {
      return [
        {
          code: 'rules-file-missing',
          file: RULE_FILE,
          message: 'the rule file is missing',
          fix: `restore ${RULE_FILE}; the instruction files are generated from it`,
        },
      ];
    }
    return parsed.findings;
  },
};

const instructionsFresh = {
  id: 'instructions-fresh',
  run(repo, parsed) {
    const expected = renderInstructions(parsed.rules, RULE_FILE);
    const findings = [];
    for (const [file, text] of expected) {
      if (repo.read(file) !== text) {
        findings.push({
          code: 'instructions-stale',
          file,
          message: 'does not match what the rules generate',
          fix: 'run `npm run generate:agent-instructions` and commit the result',
        });
      }
    }
    for (const file of repo.files()) {
      if (file.startsWith(`${INSTRUCTIONS_DIR}/`) && !expected.has(file)) {
        findings.push({
          code: 'instructions-orphan',
          file,
          message: 'no rule generates this file',
          fix: 'run `npm run generate:agent-instructions`, which deletes it',
        });
      }
    }
    return findings;
  },
};

const pathsExist = {
  id: 'paths-exist',
  run(repo) {
    const files = repo.files();
    const index = pathIndex(files);
    const roots = topLevelNames(files);
    const findings = [];
    for (const doc of docPaths(files)) {
      for (const ref of pathRefs(repo.read(doc) ?? '')) {
        const { token, line } = ref;
        if (
          isCheckedRef(ref, roots) &&
          !refResolves(index, doc, token) &&
          !repo.ignored(token)
        ) {
          findings.push({
            code: 'path-missing',
            file: doc,
            line,
            message: `"${token}" does not exist in the repo`,
            fix: 'fix the path, or delete the reference. Gitignored paths (build output) are allowed.',
          });
        }
      }
    }
    return findings;
  },
};

const LINT_CONFIG_FILE = '.oxlintrc.json';
const LINTED_EXTENSIONS = /\.(?:[cm]?[jt]sx?)$/;

// Oxlint names the rules it took from @typescript-eslint and react-hooks after
// its own plugins. A claim may use either name.
const RULE_ALIASES = [
  ['@typescript-eslint/', 'typescript/'],
  ['react-hooks/', 'react/'],
];

const ruleNames = (rule) => [
  rule,
  ...RULE_ALIASES.filter(([from]) => rule.startsWith(from)).map(
    ([from, to]) => to + rule.slice(from.length),
  ),
];

// `.oxlintrc.json` may hold comments, which JSON.parse rejects. A `//` or `/*`
// inside a string (a glob such as "**/*.ts") is not a comment.
const stripJsonComments = (text) => {
  let out = '';
  let inString = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (inString) {
      out += char;
      if (char === '\\') {
        out += next ?? '';
        i++;
      } else if (char === '"') {
        inString = false;
      }
    } else if (char === '"') {
      inString = true;
      out += char;
    } else if (char === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i++;
      out += '\n';
    } else if (char === '/' && next === '*') {
      i = text.indexOf('*/', i + 2);
      i = i === -1 ? text.length : i + 1;
    } else {
      out += char;
    }
  }
  return out;
};

const readLintConfig = (repo) => {
  const text = repo.read(LINT_CONFIG_FILE);
  if (text === null) {
    return null;
  }
  try {
    return JSON.parse(stripJsonComments(text));
  } catch {
    return null;
  }
};

// The level Oxlint gives `rule` for `file`: the base rules, then each override
// whose `files` match, in order. `null` means Oxlint does not lint the file.
const oxlintLevel = (config, file, rule) => {
  if (
    !LINTED_EXTENSIONS.test(file) ||
    (config.ignorePatterns ?? []).some((glob) => matchesGlob(file, glob))
  ) {
    return null;
  }
  const names = ruleNames(rule);
  let setting;
  const apply = (rules) => {
    for (const name of names) {
      if (rules?.[name] !== undefined) {
        setting = rules[name];
      }
    }
  };
  apply(config.rules);
  for (const override of config.overrides ?? []) {
    if (override.files.some((glob) => matchesGlob(file, glob))) {
      apply(override.rules);
    }
  }
  return Array.isArray(setting) ? setting[0] : (setting ?? 'off');
};

const lintClaims = {
  id: 'lint-claims',
  run(repo, parsed) {
    const claims = parsed.rules.filter(
      (rule) => rule.enforcedBy.kind === 'lint',
    );
    if (claims.length === 0) {
      return [];
    }
    const config = readLintConfig(repo);
    if (config === null) {
      return [
        {
          code: 'lint-config-missing',
          file: RULE_FILE,
          line: claims[0].line,
          message: `${LINT_CONFIG_FILE} is missing or is not valid JSON, so the lint claims cannot be checked`,
          fix: `restore ${LINT_CONFIG_FILE}, or change Enforced by`,
        },
      ];
    }
    const findings = [];
    for (const rule of claims) {
      const candidates = repo
        .files()
        .filter((file) =>
          rule.scope.some((glob) => globToRegExp(glob).test(file)),
        );
      // A rule may cover files Oxlint does not lint (package.json, README, ...);
      // the claim holds when at least one scope match runs the claimed rule.
      const levels = candidates
        .map((file) => [file, oxlintLevel(config, file, rule.enforcedBy.rule)])
        .filter(([, level]) => level !== null);
      if (levels.length === 0) {
        findings.push({
          code: candidates.length
            ? 'lint-claim-not-error'
            : 'lint-claim-no-file',
          file: RULE_FILE,
          line: rule.line,
          message: candidates.length
            ? `${rule.id} is enforced by lint, but oxlint never lints any file matching its Scope`
            : `${rule.id} is enforced by lint, but no file matches its Scope`,
          fix: 'fix the Scope, or change Enforced by to AI or human',
        });
        continue;
      }
      const [usable, level] =
        levels.find(([, candidate]) => LINT_ERROR_LEVELS.includes(candidate)) ??
        levels[0];
      if (!LINT_ERROR_LEVELS.includes(level)) {
        findings.push({
          code: 'lint-claim-not-error',
          file: RULE_FILE,
          line: rule.line,
          message: `${rule.id} says lint enforces ${rule.enforcedBy.rule}, but oxlint gives ${usable} ${JSON.stringify(level ?? null)}`,
          fix: `set ${rule.enforcedBy.rule} to error in ${LINT_CONFIG_FILE}, or change Enforced by`,
        });
      }
    }
    return findings;
  },
};

const bans = {
  id: 'bans',
  run(repo, parsed) {
    const manifests = repo
      .files()
      .filter(
        (file) => file === 'package.json' || file.endsWith('/package.json'),
      );
    const findings = [];
    for (const rule of parsed.rules) {
      for (const name of rule.bans) {
        for (const manifest of manifests) {
          if (dependencyNames(repo.read(manifest)).includes(name)) {
            findings.push({
              code: 'banned-package',
              file: manifest,
              message: `${name} is listed here, but ${rule.id} bans it (${RULE_FILE}:${rule.line})`,
              fix: `remove ${name} from this package, or remove it from the Bans field of ${rule.id}`,
            });
          }
        }
      }
    }
    return findings;
  },
};

// Folders that `openspec update` writes its generated skills into.
const OPENSPEC_SKILL_DIRS = ['.agents/skills', '.claude/skills'];

const openspecFresh = {
  id: 'openspec-fresh',
  run(repo) {
    if (repo.read('openspec/config.yaml') === null) return [];
    const dirty = () =>
      repo
        .exec('git', [
          'status',
          '--porcelain',
          '--untracked-files=all',
          '--',
          ...OPENSPEC_SKILL_DIRS,
        ])
        .stdout.split('\n')
        .filter(Boolean);
    const before = new Set(dirty());
    const update = repo.exec('npx', [
      '--no-install',
      'openspec',
      'update',
      '--force',
    ]);
    if (update.status !== 0) {
      return [
        {
          code: 'openspec-update-failed',
          file: 'package.json',
          message: '`openspec update --force` failed',
          fix: 'run `npm install`, so the pinned @fission-ai/openspec is installed',
        },
      ];
    }
    const changed = dirty().filter((line) => !before.has(line));
    // Undo what the update wrote. Only paths that were clean before are touched.
    for (const line of changed) {
      const file = line.slice(3);
      if (line.startsWith('??')) repo.exec('git', ['clean', '-fq', '--', file]);
      else repo.exec('git', ['checkout', '--', file]);
    }
    return changed.map((line) => ({
      code: 'openspec-stale',
      file: line.slice(3),
      message: 'differs from what `openspec update --force` generates',
      fix: 'run `npx openspec update --force` and commit the result. Generated OpenSpec skills are not edited by hand',
    }));
  },
};

const conflicts = {
  id: 'conflicts',
  run(repo) {
    const docs = agentDocPaths(repo.files());
    const findings = [];
    for (const table of CONFLICTS) {
      const [first, second] = table.sides.map((side) =>
        matchesIn(repo, docs, side),
      );
      for (const late of second) {
        const early = first.find((hit) => hit.file !== late.file);
        if (early) {
          findings.push({
            code: 'conflict',
            file: late.file,
            line: late.line,
            message: `"${table.sides[1].name}" contradicts "${table.sides[0].name}" in ${early.file}:${early.line} (${table.id})`,
            fix: table.fix,
          });
        }
      }
    }
    return findings;
  },
};

/** The checks, in run order. Add a check as one entry here. */
export const CHECKS = [
  rulesGrammar,
  instructionsFresh,
  pathsExist,
  lintClaims,
  bans,
  conflicts,
  openspecFresh,
];

/**
 * Runs every check against `repo`. Repo problems are findings, not exceptions.
 * A check that throws becomes one finding, and the other checks still run.
 * @param {object} repo
 * @param {Array<{id: string, run: Function}>} [checks=CHECKS]
 * @returns {Array<{code: string, file: string, line?: number, message: string, fix: string}>}
 */
export function check(repo, checks = CHECKS) {
  const parsed = parseRules(repo.read(RULE_FILE) ?? '', RULE_FILE);
  const findings = [];
  for (const entry of checks) {
    try {
      findings.push(...entry.run(repo, parsed));
    } catch (error) {
      findings.push({
        code: 'check-crashed',
        file: CHECK_FILE,
        message: `check "${entry.id}" threw: ${error.message}`,
        fix: `fix check "${entry.id}" in ${CHECK_FILE}`,
      });
    }
  }
  return sortFindings(findings);
}

/**
 * Repo adapter for a git work tree. `files` lists tracked and untracked,
 * non-ignored files that exist on disk. `ignored` says whether .gitignore
 * covers a path. `exec` runs a command in the root.
 */
export function diskRepo(root) {
  const listed = spawnSync(
    'git',
    ['ls-files', '-co', '--exclude-standard', '-z'],
    {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    },
  );
  if (listed.status !== 0) {
    throw new Error(`${root} is not a git work tree`);
  }
  const files = [...new Set(listed.stdout.split('\0').filter(Boolean))]
    .filter((file) => existsSync(join(root, file)))
    .sort();
  return {
    files: () => files,
    ignored(path) {
      const result = spawnSync(
        'git',
        ['check-ignore', '-q', '--no-index', path],
        {
          cwd: root,
        },
      );
      return result.status === 0;
    },
    read(file) {
      try {
        return readFileSync(join(root, file), 'utf8');
      } catch {
        return null;
      }
    },
    exec(command, args) {
      const result = spawnSync(command, args, { cwd: root, encoding: 'utf8' });
      return { status: result.status ?? 1, stdout: result.stdout ?? '' };
    },
  };
}

function matchesIn(repo, docs, side) {
  const hits = [];
  for (const doc of docs) {
    if (side.exempt?.includes(doc)) continue;
    (repo.read(doc) ?? '').split('\n').forEach((line, index) => {
      if (side.pattern.test(line)) hits.push({ file: doc, line: index + 1 });
    });
  }
  return hits;
}

function dependencyNames(manifestText) {
  if (manifestText === null) return [];
  const manifest = JSON.parse(manifestText);
  return [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ].flatMap((key) => Object.keys(manifest[key] ?? {}));
}

function main(argv) {
  let root = ROOT;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1] !== undefined) {
      root = resolve(argv[++i]);
    } else {
      process.stderr.write('usage: check-agent-docs [--root <dir>]\n');
      return 2;
    }
  }
  let findings;
  try {
    findings = check(diskRepo(root));
  } catch (error) {
    process.stderr.write(`check-agent-docs: ${error.message}\n`);
    return 2;
  }
  for (const finding of findings) process.stderr.write(formatFinding(finding));
  if (findings.length > 0) {
    process.stderr.write(`check-agent-docs: ${findings.length} problem(s)\n`);
    return 1;
  }
  process.stdout.write('check-agent-docs: ok\n');
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  process.exitCode = main(process.argv.slice(2));
}
