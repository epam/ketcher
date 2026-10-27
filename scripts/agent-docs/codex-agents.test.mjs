import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  isReadOnly,
  renderCodexAgent,
  renderCodexAgents,
  rewriteLinks,
  tomlMultiline,
  tomlString,
} from './codex-agents.mjs';

const READ_ONLY = [
  '---',
  'name: demo-reviewer',
  'description: Reviews a "diff". Use it often.',
  'tools: Glob, Grep, Read',
  'model: inherit',
  '---',
  '',
  'Load [rules](../../.memory-bank/review-rules.md).',
  '',
].join('\n');

const WRITER = READ_ONLY.replace('Glob, Grep, Read', 'Glob, Read, Write, Bash');

test('a read-only agent renders name, description, sandbox, instructions', () => {
  assert.equal(
    renderCodexAgent(READ_ONLY, '.claude/agents/demo-reviewer.md'),
    [
      '# Generated from .claude/agents/demo-reviewer.md by `npm run generate:codex-agents`. Do not edit.',
      'name = "demo-reviewer"',
      'description = "Reviews a \\"diff\\". Use it often."',
      'sandbox_mode = "read-only"',
      'developer_instructions = """',
      'Load [rules](.memory-bank/review-rules.md).',
      '"""',
      '',
    ].join('\n'),
  );
});

test('a write-capable agent has no sandbox_mode and no model', () => {
  const out = renderCodexAgent(WRITER, '.claude/agents/demo-reviewer.md');
  assert.doesNotMatch(out, /sandbox_mode/);
  assert.doesNotMatch(out, /^model/m);
});

test('isReadOnly looks for each write-capable tool', () => {
  assert.equal(isReadOnly('Glob, Grep, Read'), true);
  for (const tool of ['Write', 'Edit', 'Bash', 'NotebookEdit']) {
    assert.equal(isReadOnly(`Read, ${tool}`), false);
  }
  assert.equal(isReadOnly(undefined), false);
});

test('relative links become repo-root-relative; URLs and anchors stay', () => {
  assert.equal(
    rewriteLinks(
      '[a](../../x/y.md#h) [b](https://e.com/a) [c](#top) [d](./z.md) [e](/abs)',
    ),
    '[a](x/y.md#h) [b](https://e.com/a) [c](#top) [d](.claude/agents/z.md) [e](/abs)',
  );
});

test('tomlString escapes quotes, backslashes, and newlines', () => {
  assert.equal(tomlString('a"b\\c\nd'), '"a\\"b\\\\c\\nd"');
});

test('tomlMultiline escapes backslashes and triple quotes', () => {
  assert.equal(
    tomlMultiline('say """hi""" and C:\\x\n'),
    '"""\nsay \\"\\"\\"hi\\"\\"\\" and C:\\\\x\n"""',
  );
  assert.equal(tomlMultiline('ends with "'), '"""\nends with \\""""');
});

test('only .claude/agents/*.md files produce roles', () => {
  const out = renderCodexAgents({
    '.claude/agents/demo-reviewer.md': READ_ONLY,
    '.claude/agents/notes.txt': 'x',
    '.claude/agents/sub/deep.md': READ_ONLY,
  });
  assert.deepEqual([...out.keys()], ['.codex/agents/demo-reviewer.toml']);
});

test('frontmatter without a name is an error', () => {
  assert.throws(
    () => renderCodexAgent('---\ndescription: d\n---\nbody\n', 'a.md'),
    /no name/,
  );
  assert.throws(() => renderCodexAgent('body\n', 'a.md'), /no frontmatter/);
});
