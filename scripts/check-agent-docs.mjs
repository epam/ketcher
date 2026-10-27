#!/usr/bin/env node
// Checks that the agent instructions agree with each other and with the repo.
// Run with `npm run check:agent-docs`. Exit 0 when every check passes, 1 when
// a check finds a problem, 2 when the check cannot run.
//
// Each check is one entry in CHECKS: { id, run(repo, parsed) -> Finding[] }.
// `repo` is the disk adapter below, or an in-memory stand-in in tests.

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
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

// Agents that may commit and push without asking (D14). Their commit step is
// the exception to the ask-first rule, so they are not a conflict source.
const UNATTENDED_AGENTS = [
  '.claude/agents/ticket-implementer.md',
  '.claude/agents/ticket-sweep.md',
  '.claude/skills/handle-tickets/SKILL.md',
];

// Each conflict lists two sides. A match on the second side in one file that
// has a match on the first side in another file is reported on the second.
const CONFLICTS = [
  {
    id: 'commit-policy',
    fix: 'make the agent files agree with AGENTS.md "Git and commits"',
    sides: [
      {
        name: 'ask before commit',
        pattern:
          /\bask\b[^.\n]*\bbefore (?:you )?commit\b|\bcommit only after\b/i,
      },
      {
        name: 'commit and push without asking',
        pattern: /\bcommit\b[^.\n]*\band push\b/i,
        exempt: UNATTENDED_AGENTS,
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
        if (isCheckedRef(ref, roots) && !refResolves(index, doc, token)) {
          findings.push({
            code: 'path-missing',
            file: doc,
            line,
            message: `"${token}" does not exist in the repo`,
            fix: 'fix the path, or delete the reference. Ignored files do not count.',
          });
        }
      }
    }
    return findings;
  },
};

const lintClaims = {
  id: 'lint-claims',
  run(repo, parsed) {
    const claims = parsed.rules.filter(
      (rule) => rule.enforcedBy.kind === 'lint',
    );
    const findings = [];
    const configs = new Map();
    for (const rule of claims) {
      const target = repo
        .files()
        .find((file) =>
          rule.scope.some((glob) => globToRegExp(glob).test(file)),
        );
      if (!target) {
        findings.push({
          code: 'lint-claim-no-file',
          file: RULE_FILE,
          line: rule.line,
          message: `${rule.id} is enforced by lint, but no file matches its Scope`,
          fix: 'fix the Scope, or change Enforced by to AI or human',
        });
        continue;
      }
      if (!configs.has(target)) {
        const result = repo.exec('npx', [
          '--no-install',
          'eslint',
          '--print-config',
          target,
        ]);
        configs.set(
          target,
          result.status === 0 ? JSON.parse(result.stdout) : null,
        );
      }
      const config = configs.get(target);
      const setting = config?.rules?.[rule.enforcedBy.rule];
      const level = Array.isArray(setting) ? setting[0] : setting;
      if (!LINT_ERROR_LEVELS.includes(level)) {
        findings.push({
          code: 'lint-claim-not-error',
          file: RULE_FILE,
          line: rule.line,
          message: `${rule.id} says lint enforces ${rule.enforcedBy.rule}, but eslint gives ${target} ${JSON.stringify(level ?? null)}`,
          fix: `set ${rule.enforcedBy.rule} to error in eslint.config.mjs, or change Enforced by`,
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
 * non-ignored files that exist on disk. `exec` runs a command in the root.
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
