import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { parseRules } from '../agent-docs/rules.mjs';
import { isReviewRule, ruleMatches, rulesText, selectRules } from './rules.mjs';

const block = ({ num, scope, enforcedBy = 'AI', status = 'active' }) =>
  [
    `### R${num}: Rule ${num}`,
    '',
    `Scope: ${scope}`,
    'Severity: major',
    `Enforced by: ${enforcedBy}`,
    `Status: ${status}`,
    `Why: Reason ${num}.`,
    'Source: agent-docs',
  ].join('\n');

const ids = (rules) => rules.map((rule) => rule.id);

test('only rules the AI review checks are kept', () => {
  const text = [
    block({ num: 1, scope: 'src/**' }),
    block({ num: 2, scope: 'src/**', status: 'proposed' }),
    block({ num: 3, scope: 'src/**', status: 'retired' }),
    block({ num: 4, scope: 'src/**', status: 'moved-to-lint' }),
    block({ num: 5, scope: 'src/**', enforcedBy: 'human' }),
    block({ num: 6, scope: 'src/**', enforcedBy: 'lint(some/rule)' }),
    block({ num: 7, scope: 'src/**', enforcedBy: 'tsc' }),
  ].join('\n\n');
  assert.deepEqual(ids(selectRules(text, ['src/a.ts']).rules), ['R1', 'R2']);
});

test('a rule applies when its Scope matches one of the changed files', () => {
  const { rules } = parseRules(
    block({ num: 1, scope: 'packages/*/src/**, ketcher-autotests/tests/**' }),
    'rules.md',
  );
  assert.equal(ruleMatches(rules[0], ['packages/ketcher-core/src/a.ts']), true);
  assert.equal(ruleMatches(rules[0], ['ketcher-autotests/tests/a.ts']), true);
  assert.equal(ruleMatches(rules[0], ['README.md', 'scripts/x.mjs']), false);
});

test('a block that does not parse is reported and the other rules apply', () => {
  const broken = '### R9: Missing fields\n\nScope: src/**';
  const text = [block({ num: 1, scope: 'src/**' }), broken].join('\n\n');
  const { rules, findings } = selectRules(text, ['src/a.ts']);
  assert.deepEqual(ids(rules), ['R1']);
  assert.ok(findings.length > 0);
});

test('the prompt text names each rule with its severity and status', () => {
  const { rules } = selectRules(
    block({ num: 5, scope: 'src/**', status: 'proposed' }),
    ['src/a.ts'],
  );
  assert.equal(
    rulesText(rules),
    [
      '### R5: Rule 5',
      '',
      'Severity: major. Status: proposed.',
      'Why: Reason 5.',
    ].join('\n'),
  );
});

test('the real rules file parses and gives only AI rules', () => {
  const file = fileURLToPath(
    new URL('../../.memory-bank/review-rules.md', import.meta.url),
  );
  const text = readFileSync(file, 'utf8');
  const { rules, findings } = selectRules(text, [
    'packages/ketcher-react/src/script/ui/App.tsx',
  ]);
  assert.deepEqual(findings, []);
  assert.ok(rules.length > 0);
  assert.ok(rules.every(isReviewRule));
});
