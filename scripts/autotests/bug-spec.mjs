#!/usr/bin/env node
// Plans and checks what the Claude Implement Autotests workflow adds to a bugs
// spec file, Chromium-popup/Bugs/ketcher-<version>-bugs.spec.ts, for an
// "Autotests for Ketcher <version> bugs" ticket. The model writes the
// scenarios; this script gives it the case numbers and checks the result.
//
// Usage, from the repository root:
//   node scripts/autotests/bug-spec.mjs plan <ticket.json>
//     Prints the case plan for the prompt, one line per bug.
//   node scripts/autotests/bug-spec.mjs check <ticket.json>
//     Compares the working tree with HEAD and prints a markdown report for the
//     PR body. Exits with 1 when the change edits or removes a test that was
//     already in the file, or an existing test-data file.
//
// ticket.json, written by the workflow's extract step:
//   { version, specPath, autotestUrl, bugs: [{ ref, url }] }

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { fileURLToPath } from 'node:url';

import { SPECS_DIR, TEST_DATA_DIR } from './move-test-data.mjs';

const DEFAULT_SEPARATOR = ' — ';

/**
 * @typedef {{ ref: string, url: string }} Bug
 *   ref is "<owner>/<repo>#<number>".
 * @typedef {{ version: string, specPath: string, autotestUrl: string, bugs: Bug[] }} Ticket
 * @typedef {{ title: string, caseNumber: number | null, start: number, end: number, text: string }} SpecTest
 *   text is the whole test(...) call, from `test` to its closing parenthesis and semicolon.
 * @typedef {{ status: 'new' | 'modified' | 'deleted', path: string }} Change
 */

// A test call and its title, which can be on the next line. test.step,
// test.describe, and test.fail(condition, ...) inside a test do not match.
const TEST_CALL =
  /^([ \t]*)test(?:\.(?:skip|fail|fixme|only))?\(\s*(['"`])((?:\\.|(?!\2)[^\\])*)\2/gm;
// A numbered title: "Case 26 — ...", "Case 7: ...", "Case 44 - ...", or "22. ...".
const CASE_TITLE = /^(Case\s+)?(\d+)(\s*[—–:.)-]\s*)/i;
const CLOSERS = { ')': '(', '}': '{' };

/**
 * Returns the index of the quote that ends the string starting at `start`.
 * @param {string} text
 * @param {number} start Index of the opening quote.
 * @returns {number} -1 when the string does not end on its line.
 */
function skipString(text, start) {
  const quote = text[start];
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
    } else if (text[i] === quote) {
      return i;
    } else if (text[i] === '\n') {
      return -1;
    }
  }
  return -1;
}

/**
 * Returns the index of the backtick that ends the template literal starting at
 * `start`, skipping its ${...} expressions.
 * @param {string} text
 * @param {number} start Index of the opening backtick.
 * @returns {number} -1 when it does not end.
 */
function skipTemplate(text, start) {
  for (let i = start + 1; i < text.length; i++) {
    if (text[i] === '\\') {
      i++;
    } else if (text[i] === '`') {
      return i;
    } else if (text[i] === '$' && text[i + 1] === '{') {
      i = scanCode(text, i + 2, '}');
      if (i < 0) {
        return -1;
      }
    }
  }
  return -1;
}

/**
 * Scans code from `start` to the closer that matches an opener before it,
 * skipping strings, template literals, and comments. Regular expression
 * literals are not recognised, and spec files rarely have one with a bracket or
 * a quote in it. One that leaves a quote open makes parseTests stop; one with
 * an unmatched `)` ends the test early, so an edit after it shows only as an
 * edit outside the tests.
 * @param {string} text
 * @param {number} start Index just after the opener.
 * @param {')' | '}'} closer
 * @returns {number} Index of the closer, or -1 when there is none.
 */
function scanCode(text, start, closer) {
  const opener = CLOSERS[closer];
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const char = text[i];
    if (char === '/' && text[i + 1] === '/') {
      i = text.indexOf('\n', i);
      if (i < 0) {
        return -1;
      }
    } else if (char === '/' && text[i + 1] === '*') {
      i = text.indexOf('*/', i + 2);
      if (i < 0) {
        return -1;
      }
      i++;
    } else if (char === "'" || char === '"') {
      i = skipString(text, i);
      if (i < 0) {
        return -1;
      }
    } else if (char === '`') {
      i = skipTemplate(text, i);
      if (i < 0) {
        return -1;
      }
    } else if (char === opener) {
      depth++;
    } else if (char === closer) {
      if (depth === 0) {
        return i;
      }
      depth--;
    }
  }
  return -1;
}

/**
 * Finds the tests in a spec file, in file order.
 * @param {string} specText
 * @returns {SpecTest[]}
 * @throws {Error} When a test call has no end that the scan can find.
 */
export function parseTests(specText) {
  return [...specText.matchAll(TEST_CALL)].map((match) => {
    const start = match.index + match[1].length;
    const title = match[3];
    const close = scanCode(specText, specText.indexOf('(', start) + 1, ')');
    if (close < 0) {
      const line = specText.slice(0, start).split('\n').length;
      throw new Error(
        `Cannot find the end of the test "${title}" at line ${line}.`,
      );
    }
    // The semicolon belongs to the test, so the code around the tests does not
    // change with their number.
    const end = close + 1 + (specText[close + 1] === ';' ? 1 : 0);
    const caseMatch = title.match(CASE_TITLE);
    return {
      title,
      caseNumber: caseMatch ? Number(caseMatch[2]) : null,
      start,
      end,
      text: specText.slice(start, end),
    };
  });
}

/**
 * Gives each bug its case number and title prefix: the numbers go on from the
 * highest case in the file, in the style of its last numbered title.
 * @param {string} beforeText The spec file before the change; empty when new.
 * @param {number} bugCount
 * @returns {{ startCase: number, prefixes: string[] }}
 */
export function planCases(beforeText, bugCount) {
  const numbered = parseTests(beforeText).filter(
    (test) => test.caseNumber !== null,
  );
  const highest = Math.max(0, ...numbered.map((test) => test.caseNumber));
  const [, word = '', , separator] =
    numbered.length > 0
      ? numbered.at(-1).title.match(CASE_TITLE)
      : [null, 'Case ', null, DEFAULT_SEPARATOR];
  const startCase = highest + 1;
  const prefixes = Array.from(
    { length: bugCount },
    (_, index) => `${word}${startCase + index}${separator}`,
  );
  return { startCase, prefixes };
}

/**
 * Returns the code outside the tests and the import statements, with all
 * whitespace collapsed, so that two files can be compared around their tests.
 * @param {string} specText
 * @returns {string}
 */
function codeAroundTests(specText) {
  let rest = '';
  let from = 0;
  for (const test of parseTests(specText)) {
    rest += specText.slice(from, test.start);
    from = test.end;
  }
  rest += specText.slice(from);
  return rest
    .replace(/^import\s[\s\S]*?\sfrom\s+['"][^'"]+['"];?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tells whether a test links the bug on a Bug line. It matches the path of the
 * bug, so that the html_url and a link with other letter case both match.
 * @param {string} text
 * @param {Bug} bug
 * @returns {boolean}
 */
function linksBug(text, bug) {
  const [repoPath, number] = bug.ref.split('#');
  return new RegExp(
    `Bug:\\s*https://github\\.com/${repoPath}/issues/${number}\\b`,
    'i',
  ).test(text);
}

/**
 * Returns the folder, below <Format>, of the test data of a bugs spec file:
 * the spec path below the specs folder, without `.spec.ts`.
 * @param {string} specPath Such as ketcher-autotests/tests/specs/Chromium-popup/Bugs/ketcher-3.15.0-bugs.spec.ts.
 * @returns {string} Such as Chromium-popup/Bugs/ketcher-3.15.0-bugs.
 */
export function bugDataFolder(specPath) {
  return posix.relative(SPECS_DIR, specPath).replace(/\.spec\.ts$/, '');
}

/**
 * Reads `git status --porcelain=v1 -z --no-renames` output, where a moved file
 * is a deleted one and a new one.
 * @param {string} porcelain
 * @returns {Change[]}
 */
export function parseStatus(porcelain) {
  return porcelain
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const code = entry.slice(0, 2);
      const path = entry.slice(3);
      if (code === '??' || code.includes('A')) {
        return { status: 'new', path };
      }
      return { status: code.includes('D') ? 'deleted' : 'modified', path };
    });
}

/**
 * Checks the tests that the change adds for the bugs of a ticket.
 * @param {{ ticket: Ticket, beforeText: string, afterText: string, changes: Change[] }} input
 *   changes are the changed files under ketcher-autotests/.
 * @returns {{ errors: string[], warnings: string[], passed: string[] }}
 *   errors stop the job; warnings and passed checks go into the PR body.
 */
export function checkBugSpec({ ticket, beforeText, afterText, changes }) {
  const errors = [];
  const warnings = [];
  const passed = [];

  const beforeTests = parseTests(beforeText);
  const afterTests = parseTests(afterText);
  const afterByTitle = new Map(afterTests.map((test) => [test.title, test]));
  for (const test of beforeTests) {
    const after = afterByTitle.get(test.title);
    if (!after) {
      errors.push(`The change removes or renames the test "${test.title}".`);
    } else if (after.text !== test.text) {
      errors.push(`The change edits the test "${test.title}".`);
    }
  }
  const testData = `${TEST_DATA_DIR}/`;
  const changedData = changes.filter(
    (change) => change.status !== 'new' && change.path.startsWith(testData),
  );
  for (const change of changedData) {
    errors.push(
      `The change ${change.status === 'deleted' ? 'deletes' : 'edits'} the existing test-data file ${change.path}.`,
    );
  }
  if (beforeTests.length > 0 && errors.length === 0) {
    passed.push(
      `The ${beforeTests.length} tests that were already in the file, and the existing test data, are unchanged.`,
    );
  }
  if (
    beforeTests.length > 0 &&
    codeAroundTests(beforeText) !== codeAroundTests(afterText)
  ) {
    warnings.push(
      'The change edits code outside the tests and the imports, such as a hook or a constant that older tests may use.',
    );
  }
  const otherEdits = changes.filter(
    (change) =>
      change.status !== 'new' &&
      change.path !== ticket.specPath &&
      !change.path.startsWith(testData),
  );
  if (otherEdits.length > 0) {
    warnings.push(
      `The change edits files that other tests may use: ${otherEdits.map((change) => change.path).join(', ')}.`,
    );
  }

  const { startCase, prefixes } = planCases(beforeText, ticket.bugs.length);
  const oldTitles = new Set(beforeTests.map((test) => test.title));
  const newTests = afterTests.filter((test) => !oldTitles.has(test.title));
  if (newTests.length !== ticket.bugs.length) {
    warnings.push(
      `${newTests.length} new tests for ${ticket.bugs.length} bugs.`,
    );
  }
  const versionLine = new RegExp(
    `Version:?\\s*${ticket.version.replaceAll('.', '\\.')}(?![\\d.])`,
  );
  let allTestsMatch = newTests.length === ticket.bugs.length;
  ticket.bugs.forEach((bug, index) => {
    const caseNumber = startCase + index;
    const test = newTests[index];
    if (!test) {
      warnings.push(`No test for ${bug.ref}, Case ${caseNumber}.`);
      allTestsMatch = false;
      return;
    }
    const problems = [];
    if (!test.title.startsWith(prefixes[index])) {
      problems.push(`the title does not start with "${prefixes[index]}"`);
    }
    if (!linksBug(test.text, bug)) {
      problems.push(`there is no "Bug: ${bug.url}" line`);
    }
    if (!test.text.includes(`Test task: ${ticket.autotestUrl}`)) {
      problems.push(`there is no "Test task: ${ticket.autotestUrl}" line`);
    }
    if (!versionLine.test(test.text)) {
      problems.push(`there is no "Version ${ticket.version}" line`);
    }
    if (problems.length > 0) {
      warnings.push(`Case ${caseNumber}, ${bug.ref}: ${problems.join('; ')}.`);
      allTestsMatch = false;
    }
  });
  if (allTestsMatch) {
    passed.push(
      `One new test per bug (${ticket.bugs.length} in all), each with its planned case number and the Test task, Bug, and Version lines.`,
    );
  }

  const folder = bugDataFolder(ticket.specPath);
  const newData = changes
    .filter((change) => change.status === 'new')
    .map((change) => change.path)
    .filter((path) => path.startsWith(testData));
  // The first folder below test-data is the format, such as KET.
  const outside = newData.filter(
    (path) =>
      !path
        .slice(testData.length)
        .split('/')
        .slice(1)
        .join('/')
        .startsWith(`${folder}/`),
  );
  if (outside.length > 0) {
    warnings.push(
      `New test-data files outside <Format>/${folder}/: ${outside.join(', ')}.`,
    );
  } else if (newData.length > 0) {
    passed.push(`The new test-data files are in <Format>/${folder}/.`);
  }

  return { errors, warnings, passed };
}

/**
 * Formats the result for the PR body.
 * @param {{ errors: string[], warnings: string[], passed: string[] }} result
 * @returns {string}
 */
export function formatReport({ errors, warnings, passed }) {
  return [
    'Checks of the bug tests:',
    '',
    ...[...errors, ...warnings].map((message) => `- ✗ ${message}`),
    ...passed.map((message) => `- ✓ ${message}`),
  ].join('\n');
}

/**
 * Formats the case plan for the prompt.
 * @param {Ticket} ticket
 * @param {string[]} prefixes
 * @returns {string}
 */
export function formatPlan(ticket, prefixes) {
  return ticket.bugs
    .map((bug, index) => `- ${prefixes[index]}<description> for ${bug.ref}`)
    .join('\n');
}

/**
 * Returns a file as HEAD has it, or an empty string when HEAD does not have it.
 * @param {string} path
 * @returns {string}
 */
function fileAtHead(path) {
  const listed = execFileSync(
    'git',
    ['ls-tree', '--name-only', 'HEAD', '--', path],
    {
      encoding: 'utf8',
    },
  );
  return listed.trim() === ''
    ? ''
    : execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' });
}

function main(argv) {
  const [command, ticketPath] = argv;
  if (!ticketPath || !['plan', 'check'].includes(command)) {
    console.error(
      'Usage: bug-spec.mjs plan <ticket.json> | check <ticket.json>',
    );
    return 2;
  }
  /** @type {Ticket} */
  const ticket = JSON.parse(readFileSync(ticketPath, 'utf8'));
  const currentText = existsSync(ticket.specPath)
    ? readFileSync(ticket.specPath, 'utf8')
    : '';
  if (command === 'plan') {
    const { prefixes } = planCases(currentText, ticket.bugs.length);
    console.log(formatPlan(ticket, prefixes));
    return 0;
  }
  const result = checkBugSpec({
    ticket,
    beforeText: fileAtHead(ticket.specPath),
    afterText: currentText,
    changes: parseStatus(
      execFileSync(
        'git',
        [
          'status',
          '--porcelain=v1',
          '-z',
          '--no-renames',
          '--untracked-files=all',
          '--',
          'ketcher-autotests',
        ],
        { encoding: 'utf8' },
      ),
    ),
  });
  console.log(formatReport(result));
  return result.errors.length > 0 ? 1 : 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
