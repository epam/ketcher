#!/usr/bin/env node
// Writes .github/instructions/*.instructions.md from .memory-bank/review-rules.md.
// Run with `npm run generate:agent-instructions`. The folder is generator-owned:
// any file in it that the rules do not produce is deleted.

import {
  readFileSync,
  mkdirSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { formatFinding } from './agent-docs/findings.mjs';
import {
  INSTRUCTIONS_DIR,
  RULE_FILE,
  parseRules,
  renderInstructions,
} from './agent-docs/rules.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Regenerates the instruction folder under `root`. When the rules have findings,
 * nothing is written and the findings are returned.
 * @returns {{findings: object[], written: string[], removed: string[]}}
 */
export function generateInstructions(root) {
  const { rules, findings } = parseRules(
    readFileSync(join(root, RULE_FILE), 'utf8'),
    RULE_FILE,
  );
  if (findings.length > 0) return { findings, written: [], removed: [] };

  const expected = renderInstructions(rules, RULE_FILE);
  const dir = join(root, INSTRUCTIONS_DIR);
  mkdirSync(dir, { recursive: true });
  const removed = [];
  for (const name of readdirSync(dir)) {
    const file = `${INSTRUCTIONS_DIR}/${name}`;
    if (!expected.has(file)) {
      rmSync(join(root, file));
      removed.push(file);
    }
  }
  for (const [file, text] of expected) {
    writeFileSync(join(root, file), text);
  }
  return { findings: [], written: [...expected.keys()], removed };
}

function main(argv) {
  let root = ROOT;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--root' && argv[i + 1] !== undefined) {
      root = resolve(argv[++i]);
    } else {
      process.stderr.write(
        'usage: generate-agent-instructions [--root <dir>]\n',
      );
      return 2;
    }
  }
  let result;
  try {
    result = generateInstructions(root);
  } catch (error) {
    process.stderr.write(`generate-agent-instructions: ${error.message}\n`);
    return 2;
  }
  if (result.findings.length > 0) {
    for (const finding of result.findings)
      process.stderr.write(formatFinding(finding));
    process.stderr.write(
      'generate-agent-instructions: nothing written; fix the rules first\n',
    );
    return 1;
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
