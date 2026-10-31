import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { globToRegExp } from '../agent-docs/paths.mjs';
import {
  LABELS,
  MAX_INLINE_COMMENTS,
  MAX_ROUNDS,
  MAX_VERIFIED_FINDINGS,
  MODELS,
  PROMPT_DIR,
  QUICK_LENSES,
  RUN_LIMITS,
  SENSITIVE_PATHS,
  SKIP_PATHS,
  STANDARD_LENSES,
  VERIFIER_ROLE,
} from './config.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

test('every lens and the verifier role have a prompt file', () => {
  for (const name of [...STANDARD_LENSES, VERIFIER_ROLE]) {
    const file = join(repoRoot, PROMPT_DIR, `${name}.md`);
    assert.ok(existsSync(file), `missing prompt file ${file}`);
  }
});

test('Quick lenses are a subset of the Standard lenses', () => {
  for (const lens of QUICK_LENSES) {
    assert.ok(STANDARD_LENSES.includes(lens), `${lens} is not a Standard lens`);
  }
});

test('labels are distinct', () => {
  const names = Object.values(LABELS);
  assert.equal(new Set(names).size, names.length);
});

test('model IDs are exact IDs, not aliases', () => {
  for (const id of Object.values(MODELS)) {
    assert.match(id, /^claude-[a-z]+-\d+-\d+$/);
  }
});

test('no sensitive path is skipped', () => {
  const skip = SKIP_PATHS.map(globToRegExp);
  const samples = [
    'packages/ketcher-core/src/application/editor/Editor.ts',
    'packages/ketcher-core/src/application/formatters/formatterFactory.ts',
    'packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts',
  ];
  for (const file of samples) {
    assert.ok(
      SENSITIVE_PATHS.some((glob) => globToRegExp(glob).test(file)),
      `${file} is not sensitive`,
    );
    assert.ok(!skip.some((re) => re.test(file)), `${file} is skipped`);
  }
});

test('skip paths cover autotests, lockfiles and snapshots', () => {
  const skip = SKIP_PATHS.map(globToRegExp);
  for (const file of [
    'ketcher-autotests/tests/specs/a.spec.ts',
    'package-lock.json',
    'packages/ketcher-react/package-lock.json',
    'packages/ketcher-react/src/__snapshots__/a.test.tsx.snap',
  ]) {
    assert.ok(
      skip.some((re) => re.test(file)),
      `${file} is not skipped`,
    );
  }
});

test('limits are positive and the caps fit the output contract', () => {
  for (const limits of Object.values(RUN_LIMITS)) {
    assert.ok(limits.maxTurns > 0);
    assert.ok(limits.maxBudgetUsd > 0);
  }
  assert.ok(MAX_VERIFIED_FINDINGS > 0);
  assert.ok(MAX_INLINE_COMMENTS <= 10);
  assert.ok(MAX_ROUNDS >= 1);
});