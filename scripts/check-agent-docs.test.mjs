import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { CHECKS, check } from './check-agent-docs.mjs';
import { renderCodexAgents } from './agent-docs/codex-agents.mjs';
import {
  RULE_FILE,
  parseRules,
  renderInstructions,
} from './agent-docs/rules.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const CLI = join(HERE, 'check-agent-docs.mjs');
const FIXTURES = join(HERE, 'fixtures', 'agent-docs');

const RULES = [
  '# Review rules',
  '',
  '### R1: Keep helpers in one module',
  '',
  'Scope: src/**',
  'Severity: major',
  'Enforced by: AI',
  'Status: active',
  'Why: Helpers belong in one module.',
  'Source: agent-docs',
  '',
].join('\n');

const SRC_INSTRUCTIONS = '.github/instructions/src.instructions.md';

// In-memory stand-in for the disk adapter. `exec` answers from a stub.
function memoryRepo(files, exec = () => ({ status: 0, stdout: '' })) {
  return {
    files: () => Object.keys(files).sort(),
    read: (path) => files[path] ?? null,
    ignored: () => false,
    exec,
  };
}

function generatedFor(rulesText) {
  const { rules } = parseRules(rulesText, RULE_FILE);
  return Object.fromEntries(renderInstructions(rules, RULE_FILE));
}

const codesAndFiles = (findings) =>
  findings.map((finding) => [finding.code, finding.file]);

test('a repo that follows its rules has no findings', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
  });
  assert.deepEqual(check(repo, CHECKS), []);
});

test('a stale instruction file is named', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    [SRC_INSTRUCTIONS]: 'old text\n',
  });
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['instructions-stale', SRC_INSTRUCTIONS],
  ]);
});

test('an instruction file that no rule generates is named', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
    '.github/instructions/old.instructions.md': 'stale\n',
  });
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['instructions-orphan', '.github/instructions/old.instructions.md'],
  ]);
});

const AGENT_MD = '.claude/agents/demo-reviewer.md';
const AGENT_TOML = '.codex/agents/demo-reviewer.toml';
const AGENT_TEXT =
  '---\nname: demo-reviewer\ndescription: Demo.\ntools: Read\n---\n\nBody.\n';
const generatedAgents = () =>
  Object.fromEntries(renderCodexAgents({ [AGENT_MD]: AGENT_TEXT }));

test('fresh Codex agent files have no findings', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
    [AGENT_MD]: AGENT_TEXT,
    ...generatedAgents(),
  });
  assert.deepEqual(check(repo, CHECKS), []);
});

test('a stale or missing Codex agent file is named', () => {
  const base = { [RULE_FILE]: RULES, ...generatedFor(RULES) };
  const stale = memoryRepo({
    ...base,
    [AGENT_MD]: AGENT_TEXT,
    [AGENT_TOML]: 'old\n',
  });
  assert.deepEqual(codesAndFiles(check(stale, CHECKS)), [
    ['codex-agents-stale', AGENT_TOML],
  ]);
  const missing = memoryRepo({ ...base, [AGENT_MD]: AGENT_TEXT });
  assert.deepEqual(codesAndFiles(check(missing, CHECKS)), [
    ['codex-agents-stale', AGENT_TOML],
  ]);
});

test('an orphan Codex agent file is named', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
    [AGENT_MD]: AGENT_TEXT,
    ...generatedAgents(),
    '.codex/agents/old.toml': 'x\n',
  });
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['codex-agents-orphan', '.codex/agents/old.toml'],
  ]);
});

test('a dangling link names the doc and the line', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
    'AGENTS.md': 'Intro\n\nSee [setup](docs/missing.md).\n',
  });
  const [finding] = check(repo, CHECKS);
  assert.equal(finding.code, 'path-missing');
  assert.equal(finding.file, 'AGENTS.md');
  assert.equal(finding.line, 3);
  assert.match(finding.message, /docs\/missing\.md/);
});

test('a bare file name in backticks is not checked, a missing repo path is', () => {
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
    'packages/a/b.ts': '',
    'AGENTS.md':
      'Edit `types.ts` in `packages/a/b.ts`, not `packages/nope/x.ts`.\n',
  });
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['path-missing', 'AGENTS.md'],
  ]);
});

test('a banned package listed in a manifest is named', () => {
  const rules = RULES.replace(
    'Source: agent-docs',
    'Source: agent-docs\nBans: lodash',
  );
  const repo = memoryRepo({
    [RULE_FILE]: rules,
    ...generatedFor(rules),
    'packages/a/package.json': JSON.stringify({
      dependencies: { lodash: '^4.0.0' },
    }),
  });
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['banned-package', 'packages/a/package.json'],
  ]);
});

test('a lint claim is checked against the ESLint level for a file in Scope', () => {
  const rules = RULES.replace('Enforced by: AI', 'Enforced by: lint(no-alert)');
  const calls = [];
  const exec = (command, args) => {
    calls.push([command, args]);
    return {
      status: 0,
      stdout: JSON.stringify({ rules: { 'no-alert': [0] } }),
    };
  };
  const repo = memoryRepo({ [RULE_FILE]: rules, 'src/a.js': '' }, exec);
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['lint-claim-not-error', RULE_FILE],
  ]);
  assert.deepEqual(calls, [
    ['npx', ['--no-install', 'eslint', '--print-config', 'src/a.js']],
  ]);

  const passing = memoryRepo({ [RULE_FILE]: rules, 'src/a.js': '' }, () => ({
    status: 0,
    stdout: JSON.stringify({ rules: { 'no-alert': [2] } }),
  }));
  assert.deepEqual(check(passing, CHECKS), []);
});

test('an agent file that asks before committing contradicts AGENTS.md, unless it is a user-reviewed commit flow', () => {
  const agents = 'Commit, push it, and open a PR without asking.\n';
  const repo = memoryRepo({
    [RULE_FILE]: RULES,
    ...generatedFor(RULES),
    'AGENTS.md': agents,
    '.claude/commands/ship.md': 'Ask the user before you commit.\n',
    '.agents/skills/commit/SKILL.md': 'Commit only after the user approves.\n',
  });
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['conflict', '.claude/commands/ship.md'],
  ]);
});

test('a generated OpenSpec skill that differs from `openspec update --force` is named and restored', () => {
  const statuses = ['', ' M .agents/skills/openspec-explore/SKILL.md\n'];
  const calls = [];
  const repo = memoryRepo(
    { [RULE_FILE]: RULES, ...generatedFor(RULES), 'openspec/config.yaml': '' },
    (command, args) => {
      calls.push([command, ...args].join(' '));
      if (command === 'git' && args[0] === 'status') {
        return { status: 0, stdout: statuses.shift() ?? '' };
      }
      return { status: 0, stdout: '' };
    },
  );
  assert.deepEqual(codesAndFiles(check(repo, CHECKS)), [
    ['openspec-stale', '.agents/skills/openspec-explore/SKILL.md'],
  ]);
  assert.ok(
    calls.includes('git checkout -- .agents/skills/openspec-explore/SKILL.md'),
  );
});

test('the OpenSpec check is skipped in a repo without openspec/config.yaml', () => {
  const calls = [];
  const repo = memoryRepo(
    { [RULE_FILE]: RULES, ...generatedFor(RULES) },
    (command) => {
      calls.push(command);
      return { status: 0, stdout: '' };
    },
  );
  assert.deepEqual(check(repo, CHECKS), []);
  assert.ok(!calls.includes('npx'));
});

test('a check that throws becomes one finding and the other checks still run', () => {
  const boom = {
    id: 'boom',
    run() {
      throw new Error('bad input');
    },
  };
  const ok = {
    id: 'ok',
    run: () => [
      { code: 'example', file: 'AGENTS.md', message: 'found', fix: 'fix it' },
    ],
  };
  const findings = check(memoryRepo({}), [boom, ok]);
  assert.deepEqual(codesAndFiles(findings), [
    ['example', 'AGENTS.md'],
    ['check-crashed', 'scripts/check-agent-docs.mjs'],
  ]);
  assert.match(findings[1].message, /boom.*bad input/);
});

// CLI smoke tests on fixture repos: one per failure kind, plus a clean one.
const cases = [
  ['ok', 0, []],
  [
    'stale-instructions',
    1,
    [
      '.github/instructions/old.instructions.md',
      '.github/instructions/src.instructions.md',
    ],
  ],
  ['dangling-path', 1, ['AGENTS.md']],
  ['banned-package', 1, ['package.json']],
  ['lint-claim', 1, [RULE_FILE]],
  ['commit-conflict', 1, ['.claude/commands/ship.md']],
  ['rules-broken', 1, [RULE_FILE]],
];

for (const [fixture, exitCode, namedFiles] of cases) {
  test(`CLI on fixture "${fixture}" exits ${exitCode} and names the file`, () => {
    const result = spawnSync(
      process.execPath,
      [CLI, '--root', join(FIXTURES, fixture)],
      {
        encoding: 'utf8',
      },
    );
    assert.equal(result.status, exitCode, result.stderr);
    for (const file of namedFiles) {
      assert.match(
        result.stderr,
        new RegExp(file.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')),
      );
    }
  });
}

test('CLI exits 2 when the root is not a git work tree', () => {
  const result = spawnSync(process.execPath, [CLI, '--root', '/'], {
    encoding: 'utf8',
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /not a git work tree/);
});
