import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { globToRegExp } from '../agent-docs/paths.mjs';
import { TRIGGERS } from '../review-panel.mjs';
import {
  DUPLICATES_ROLE,
  LABELS,
  LINKED_ISSUE_ROLE,
  MAX_INLINE_COMMENTS,
  MAX_ROUNDS,
  MAX_VERIFIED_FINDINGS,
  MODELS,
  PROMPT_DIR,
  RUN_LIMITS,
  SKIP_PATHS,
  VERIFIER_ROLE,
} from './config.mjs';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

test('every lens the panel can pick and every role have a prompt file', () => {
  const names = [
    ...TRIGGERS.map((trigger) => trigger.lens),
    VERIFIER_ROLE,
    LINKED_ISSUE_ROLE,
    DUPLICATES_ROLE,
  ];
  for (const name of names) {
    const file = join(repoRoot, PROMPT_DIR, `${name}.md`);
    assert.ok(existsSync(file), `missing prompt file ${file}`);
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

test('no source file is skipped', () => {
  const skip = SKIP_PATHS.map(globToRegExp);
  for (const file of [
    'packages/ketcher-core/src/application/editor/Editor.ts',
    'packages/ketcher-core/src/domain/serializers/ket/ketSerializer.ts',
    'packages/ketcher-react/src/script/ui/App.tsx',
    'packages/ketcher-macromolecules/src/Editor.tsx',
  ]) {
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