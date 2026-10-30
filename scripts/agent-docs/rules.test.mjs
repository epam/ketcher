import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parseRules, renderInstructions } from './rules.mjs';

const RULE_R1 = [
  '### R1: Keep helpers in one module',
  '',
  'Scope: src/**',
  'Severity: major',
  'Enforced by: AI',
  'Status: active',
  'Why: Helpers belong in one module.',
  'Source: agent-docs',
].join('\n');

const codes = (findings) => findings.map((finding) => finding.code);

test('a valid block parses into one rule with its fields', () => {
  const { rules, findings } = parseRules(RULE_R1, 'rules.md');
  assert.deepEqual(findings, []);
  assert.equal(rules.length, 1);
  assert.equal(rules[0].id, 'R1');
  assert.deepEqual(rules[0].scope, ['src/**']);
  assert.deepEqual(rules[0].enforcedBy, { kind: 'AI' });
  assert.deepEqual(rules[0].sources, ['agent-docs']);
});

test('a missing required field is reported with the rule ID and the file', () => {
  const text = RULE_R1.replace('Why: Helpers belong in one module.\n', '');
  const { rules, findings } = parseRules(text, 'rules.md');
  assert.deepEqual(rules, []);
  assert.equal(findings[0].code, 'rule-missing-field');
  assert.equal(findings[0].file, 'rules.md');
  assert.match(findings[0].message, /R1 has no Why field/);
  assert.ok(findings[0].fix.length > 0);
});

test('a repeated rule ID is reported at the second heading and the first block still parses', () => {
  const text = [RULE_R1, '', RULE_R1].join('\n');
  const { rules, findings } = parseRules(text, 'rules.md');
  assert.equal(rules.length, 1);
  assert.equal(findings[0].code, 'rule-id-duplicate');
  assert.equal(findings[0].line, 10);
  assert.match(findings[0].message, /line 1/);
});

test('a ### heading that is not a rule block is reported', () => {
  const { findings } = parseRules('### r7: lower case\n', 'rules.md');
  assert.deepEqual(codes(findings), ['rule-heading-malformed']);
});

test('a heading-looking line inside a code fence is not a rule', () => {
  const text = [
    RULE_R1.replace('Source: agent-docs', 'Source: agent-docs\nBad: example'),
    '```',
    '### R9: inside a fence',
    '```',
    'Good: fixed',
  ].join('\n');
  const { rules, findings } = parseRules(text, 'rules.md');
  assert.deepEqual(findings, []);
  assert.equal(rules.length, 1);
  assert.equal(rules[0].bad, 'example\n```\n### R9: inside a fence\n```');
});

test('an unknown field name is reported and the rule is left out', () => {
  const text = RULE_R1.replace('Enforced by:', 'Enforced-by:');
  const { rules, findings } = parseRules(text, 'rules.md');
  assert.deepEqual(rules, []);
  assert.ok(codes(findings).includes('rule-unknown-field'));
});

test('Bad without Good is reported as a missing field', () => {
  const text = `${RULE_R1}\nBad: an example`;
  const { findings } = parseRules(text, 'rules.md');
  assert.equal(findings[0].code, 'rule-missing-field');
  assert.match(findings[0].message, /has no Good field/);
});

test('an enforcer outside the allowed set is a bad value', () => {
  const text = RULE_R1.replace('Enforced by: AI', 'Enforced by: linter');
  const { findings } = parseRules(text, 'rules.md');
  assert.equal(findings[0].code, 'rule-bad-value');
});

test('lint names its ESLint rule and counts as machine-enforced', () => {
  const text = RULE_R1.replace(
    'Enforced by: AI',
    'Enforced by: lint(no-alert)',
  );
  const { rules } = parseRules(text, 'rules.md');
  assert.deepEqual(rules[0].enforcedBy, { kind: 'lint', rule: 'no-alert' });
});

test('Danger counts as machine-enforced, so an active Danger rule is not rendered', () => {
  const text = RULE_R1.replace('Enforced by: AI', 'Enforced by: Danger');
  const { rules, findings } = parseRules(text, 'rules.md');
  assert.deepEqual(findings, []);
  assert.deepEqual(rules[0].enforcedBy, { kind: 'Danger' });
  assert.equal(renderInstructions(rules, 'rules.md').size, 0);
});

test('renders only approved and active rules that a reviewer applies, grouped by Scope', () => {
  const text = [
    RULE_R1,
    '',
    '### R2: A proposed rule',
    '',
    'Scope: src/**',
    'Severity: major',
    'Enforced by: AI',
    'Status: proposed',
    'Why: Not approved yet.',
    'Source: PR #100',
    '',
    '### R3: A lint rule',
    '',
    'Scope: src/**',
    'Severity: major',
    'Enforced by: lint(no-alert)',
    'Status: active',
    'Why: Lint covers it.',
    'Source: agent-docs',
    '',
    '### R4: A manifest rule',
    '',
    'Scope: package.json, packages/*/package.json',
    'Severity: major',
    'Enforced by: human',
    'Status: approved',
    'Why: Review new dependencies.',
    'Source: PR #101',
  ].join('\n');
  const { rules } = parseRules(text, '.memory-bank/review-rules.md');
  const files = renderInstructions(rules, '.memory-bank/review-rules.md');
  assert.deepEqual(
    [...files.keys()],
    [
      '.github/instructions/package-json-packages-package-json.instructions.md',
      '.github/instructions/src.instructions.md',
    ],
  );
  assert.equal(
    files.get('.github/instructions/src.instructions.md'),
    [
      '---',
      "applyTo: 'src/**'",
      '---',
      '',
      '<!-- Generated from .memory-bank/review-rules.md. Do not edit. -->',
      '',
      '## R1: Keep helpers in one module (major)',
      '',
      'Why: Helpers belong in one module.',
      '',
    ].join('\n'),
  );
});

test('rendering the same rules twice gives the same bytes', () => {
  const { rules } = parseRules(RULE_R1, 'rules.md');
  assert.deepEqual(
    renderInstructions(rules, 'rules.md'),
    renderInstructions(rules, 'rules.md'),
  );
});

test('two Scope lists that map to one file name are reported at the later rule', () => {
  const text = [
    '### R1: Nested scope',
    '',
    'Scope: packages/*/src/**',
    'Severity: major',
    'Enforced by: AI',
    'Status: active',
    'Why: One scope.',
    'Source: agent-docs',
    '',
    '### R2: Flat scope',
    '',
    'Scope: packages/src/**',
    'Severity: major',
    'Enforced by: AI',
    'Status: active',
    'Why: Other scope, same file name.',
    'Source: agent-docs',
  ].join('\n');
  const { findings } = parseRules(text, 'rules.md');
  assert.deepEqual(codes(findings), ['scope-slug-collision']);
  assert.equal(findings[0].line, 10);
});
