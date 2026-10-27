#!/usr/bin/env node
// Writes .codex/agents/*.toml from .claude/agents/*.md.
// Run with `npm run generate:codex-agents`. The folder is generator-owned:
// any file in it that the subagents do not produce is deleted.

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  CLAUDE_AGENTS_DIR,
  CODEX_AGENTS_DIR,
  renderCodexAgents,
} from './agent-docs/codex-agents.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Regenerates the Codex role folder under `root`.
 * @returns {{written: string[], removed: string[]}}
 */
export function generateCodexAgents(root) {
  const sourceDir = join(root, CLAUDE_AGENTS_DIR);
  const sources = {};
  if (existsSync(sourceDir)) {
    for (const name of readdirSync(sourceDir)) {
      if (name.endsWith('.md')) {
        const file = `${CLAUDE_AGENTS_DIR}/${name}`;
        sources[file] = readFileSync(join(root, file), 'utf8');
      }
    }
  }
  const expected = renderCodexAgents(sources);
  const dir = join(root, CODEX_AGENTS_DIR);
  const removed = [];
  if (existsSync(dir)) {
    for (const name of readdirSync(dir)) {
      const file = `${CODEX_AGENTS_DIR}/${name}`;
      if (!expected.has(file)) {
        rmSync(join(root, file), { recursive: true, force: true });
        removed.push(file);
      }
    }
  }
  if (expected.size > 0) mkdirSync(dir, { recursive: true });
  for (const [file, text] of expected) {
    writeFileSync(join(root, file), text);
  }
  return { written: [...expected.keys()], removed };
}

function main(argv) {
  let root = ROOT;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1] !== undefined) {
      root = resolve(argv[++i]);
    } else {
      process.stderr.write('usage: generate-codex-agents [--root <dir>]\n');
      return 2;
    }
  }
  let result;
  try {
    result = generateCodexAgents(root);
  } catch (error) {
    process.stderr.write(`generate-codex-agents: ${error.message}\n`);
    return 2;
  }
  for (const file of result.removed) process.stdout.write(`removed ${file}\n`);
  for (const file of result.written) process.stdout.write(`wrote ${file}\n`);
  return 0;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  process.exitCode = main(process.argv.slice(2));
}
