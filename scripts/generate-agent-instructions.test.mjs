import assert from 'node:assert/strict';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { generateInstructions } from './generate-agent-instructions.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(HERE, 'fixtures', 'agent-docs', 'ok');

function copyOfFixture() {
  const root = mkdtempSync(join(tmpdir(), 'agent-docs-generate-'));
  cpSync(FIXTURE, root, { recursive: true });
  return root;
}

test('generating twice gives the same bytes and removes nothing the second time', () => {
  const root = copyOfFixture();
  try {
    generateInstructions(root);
    const instructions = join(
      root,
      '.github',
      'instructions',
      'src.instructions.md',
    );
    const first = readFileSync(instructions, 'utf8');
    const second = generateInstructions(root);
    assert.deepEqual(second.removed, []);
    assert.equal(readFileSync(instructions, 'utf8'), first);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('the generator deletes files in the instructions folder that it did not produce', () => {
  const root = copyOfFixture();
  try {
    mkdirSync(join(root, '.github', 'instructions'), { recursive: true });
    writeFileSync(
      join(root, '.github', 'instructions', 'retired.instructions.md'),
      'old\n',
    );
    const result = generateInstructions(root);
    assert.deepEqual(result.removed, [
      '.github/instructions/retired.instructions.md',
    ]);
    assert.deepEqual(result.written, [
      '.github/instructions/src.instructions.md',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('when the rules have findings, nothing is written or removed', () => {
  const root = copyOfFixture();
  try {
    writeFileSync(join(root, '.memory-bank', 'review-rules.md'), '### R1: a\n');
    mkdirSync(join(root, '.github', 'instructions'), { recursive: true });
    writeFileSync(
      join(root, '.github', 'instructions', 'keep.instructions.md'),
      'keep\n',
    );
    const result = generateInstructions(root);
    assert.ok(result.findings.length > 0);
    assert.deepEqual(result.written, []);
    assert.deepEqual(result.removed, []);
    assert.equal(
      readFileSync(
        join(root, '.github', 'instructions', 'keep.instructions.md'),
        'utf8',
      ),
      'keep\n',
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
