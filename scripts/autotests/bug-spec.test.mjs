import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bugDataFolder,
  checkBugSpec,
  formatPlan,
  formatReport,
  parseStatus,
  parseTests,
  planCases,
} from './bug-spec.mjs';

const SPEC_PATH =
  'ketcher-autotests/tests/specs/Chromium-popup/Bugs/ketcher-3.15.0-bugs.spec.ts';
const BUG_DATA =
  'ketcher-autotests/tests/test-data/KET/Chromium-popup/Bugs/ketcher-3.15.0-bugs';

const TICKET = {
  version: '3.15.0',
  specPath: SPEC_PATH,
  autotestUrl: 'https://github.com/epam/ketcher/issues/9964',
  bugs: [
    {
      ref: 'epam/ketcher#9109',
      url: 'https://github.com/epam/ketcher/issues/9109',
    },
    {
      ref: 'epam/indigo#3577',
      url: 'https://github.com/epam/Indigo/issues/3577',
    },
  ],
};

const IMPORTS = "import { test } from '@fixtures';\n";

/**
 * Builds one test in the style of the bugs spec files.
 * @param {string} title
 * @param {{ bug?: string, version?: string, task?: string, body?: string }} [lines]
 * @returns {string}
 */
function bugTest(title, lines = {}) {
  const {
    bug = 'https://github.com/epam/ketcher/issues/1',
    version = '3.15.0',
    task = 'https://github.com/epam/ketcher/issues/9963',
    body = '    await page.click();\n',
  } = lines;
  return [
    `  test('${title}', async () => {`,
    '    /*',
    `     * Test task: ${task}`,
    `     * Bug: ${bug}`,
    '     * Description: something',
    '     *',
    `     * Version ${version}`,
    '     */',
    `${body}  });`,
    '',
  ].join('\n');
}

/**
 * Builds a bugs spec file around the given tests.
 * @param {string[]} tests
 * @param {string} [setup] Code before the tests, inside the describe block.
 * @returns {string}
 */
function specFile(tests, setup = '  test.beforeAll(async () => {});\n') {
  return `${IMPORTS}\ntest.describe('Bugs', () => {\n${setup}${tests.join('\n')}});\n`;
}

const OLD_TESTS = [
  bugTest('Case 24 — Old one'),
  bugTest('Case 25 — Old two', {
    body: "    test.fail(msg === 'error', `Error: ${msg}`);\n",
  }),
];

const NEW_TESTS = [
  bugTest('Case 26 — Zoom breaks', {
    bug: 'https://github.com/epam/ketcher/issues/9109',
    task: TICKET.autotestUrl,
  }),
  bugTest('Case 27 — Ring layout', {
    bug: 'https://github.com/epam/Indigo/issues/3577',
    task: TICKET.autotestUrl,
  }),
];

const BEFORE = specFile(OLD_TESTS);
const AFTER = specFile([...OLD_TESTS, ...NEW_TESTS]);

describe('parseTests', () => {
  it('finds each test call to its closing parenthesis and semicolon', () => {
    const tests = parseTests(BEFORE);
    assert.deepEqual(
      tests.map((test) => [test.title, test.caseNumber]),
      [
        ['Case 24 — Old one', 24],
        ['Case 25 — Old two', 25],
      ],
    );
    assert.ok(tests.every((test) => test.text.endsWith('});')));
  });

  it('reads a title on the line after test(', () => {
    const text = "test(\n  'Case 3: Long title',\n  async () => {},\n);\n";
    assert.equal(parseTests(text)[0].title, 'Case 3: Long title');
  });

  it('is not misled by brackets in strings, templates, and comments', () => {
    const text = [
      "test('Case 1 — a', async () => {",
      "  const s = 'it\\'s )}';",
      '  const t = `${f(")")} )`;',
      '  // )',
      '  /* ) */',
      '});',
      "test('Case 2 — b', async () => {});",
      '',
    ].join('\n');
    const tests = parseTests(text);
    assert.deepEqual(
      tests.map((test) => test.title),
      ['Case 1 — a', 'Case 2 — b'],
    );
    assert.ok(tests[0].text.endsWith('/* ) */\n});'));
  });

  it('stops on a test whose end it cannot find', () => {
    const text = [
      "test('Case 1 — a', async () => {",
      "  expect(t).toMatch(/don't/);",
      '});',
      '',
    ].join('\n');
    assert.throws(
      () => parseTests(text),
      /Cannot find the end of the test "Case 1 — a" at line 1\./,
    );
  });
});

describe('planCases', () => {
  it('numbers on from the highest case, in the style of the file', () => {
    assert.deepEqual(planCases(BEFORE, 2), {
      startCase: 26,
      prefixes: ['Case 26 — ', 'Case 27 — '],
    });
  });

  it('numbers on from the highest case when it is not the last', () => {
    const text =
      "test('Case 9 — a', () => {});\ntest('Case 5 — b', () => {});\n";
    assert.deepEqual(planCases(text, 1).prefixes, ['Case 10 — ']);
  });

  it('keeps other title styles', () => {
    assert.deepEqual(planCases("test('Case 6: x', () => {});\n", 1).prefixes, [
      'Case 7: ',
    ]);
    assert.deepEqual(
      planCases("test('22.Macro: x', () => {});\n", 1).prefixes,
      ['23.'],
    );
  });

  it('starts at Case 1 in a new file', () => {
    assert.deepEqual(planCases('', 1), {
      startCase: 1,
      prefixes: ['Case 1 — '],
    });
  });
});

describe('bugDataFolder', () => {
  it('is the spec path below the specs folder, without .spec.ts', () => {
    assert.equal(
      bugDataFolder(SPEC_PATH),
      'Chromium-popup/Bugs/ketcher-3.15.0-bugs',
    );
  });
});

describe('parseStatus', () => {
  it('reads modified, untracked, deleted, and staged new files', () => {
    const porcelain = [
      ` M ${SPEC_PATH}`,
      `?? ${BUG_DATA}/new.ket`,
      ' D ketcher-autotests/tests/test-data/KET/old.ket',
      'A  ketcher-autotests/tests/x.ket',
      '',
    ].join('\0');
    assert.deepEqual(parseStatus(porcelain), [
      { status: 'modified', path: SPEC_PATH },
      { status: 'new', path: `${BUG_DATA}/new.ket` },
      {
        status: 'deleted',
        path: 'ketcher-autotests/tests/test-data/KET/old.ket',
      },
      { status: 'new', path: 'ketcher-autotests/tests/x.ket' },
    ]);
  });
});

describe('checkBugSpec', () => {
  const specChanged = { status: 'modified', path: SPEC_PATH };

  it('passes tests added after the old ones', () => {
    const after = AFTER.replace(
      IMPORTS,
      `${IMPORTS}import { Library } from '@tests/pages/macromolecules/Library';\n`,
    );
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: BEFORE,
      afterText: after,
      changes: [specChanged, { status: 'new', path: `${BUG_DATA}/ring.ket` }],
    });
    assert.deepEqual(result, {
      errors: [],
      warnings: [],
      passed: [
        'The 2 tests that were already in the file, and the existing test data, are unchanged.',
        'One new test per bug (2 in all), each with its planned case number and the Test task, Bug, and Version lines.',
        'The new test-data files are in <Format>/Chromium-popup/Bugs/ketcher-3.15.0-bugs/.',
      ],
    });
  });

  it('stops on an edited old test, also for an added line', () => {
    const edited = specFile([
      OLD_TESTS[0].replace(
        '    await page.click();\n',
        '    await page.click();\n    await page.reload();\n',
      ),
      OLD_TESTS[1],
      ...NEW_TESTS,
    ]);
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: BEFORE,
      afterText: edited,
      changes: [specChanged],
    });
    assert.deepEqual(result.errors, [
      'The change edits the test "Case 24 — Old one".',
    ]);
  });

  it('stops on a removed old test', () => {
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: BEFORE,
      afterText: specFile([OLD_TESTS[1], ...NEW_TESTS]),
      changes: [specChanged],
    });
    assert.deepEqual(result.errors, [
      'The change removes or renames the test "Case 24 — Old one".',
    ]);
  });

  it('stops on an edited or deleted existing test-data file', () => {
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: BEFORE,
      afterText: AFTER,
      changes: [
        specChanged,
        { status: 'modified', path: `${BUG_DATA}/case3.ket` },
        {
          status: 'deleted',
          path: 'ketcher-autotests/tests/test-data/KET/old.ket',
        },
      ],
    });
    assert.deepEqual(result.errors, [
      `The change edits the existing test-data file ${BUG_DATA}/case3.ket.`,
      'The change deletes the existing test-data file ketcher-autotests/tests/test-data/KET/old.ket.',
    ]);
  });

  it('warns about edited code around the tests and other edited files', () => {
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: BEFORE,
      afterText: specFile(
        [...OLD_TESTS, ...NEW_TESTS],
        '  test.beforeAll(async () => { await setUp(); });\n',
      ),
      changes: [
        specChanged,
        {
          status: 'modified',
          path: 'ketcher-autotests/tests/pages/macromolecules/Library.ts',
        },
      ],
    });
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.warnings, [
      'The change edits code outside the tests and the imports, such as a hook or a constant that older tests may use.',
      'The change edits files that other tests may use: ketcher-autotests/tests/pages/macromolecules/Library.ts.',
    ]);
  });

  it('warns about a missing test, a wrong number, and missing lines', () => {
    const wrong = bugTest('Case 30 — Zoom breaks', {
      bug: 'https://github.com/epam/ketcher/issues/1',
      version: '3.14.0',
      task: TICKET.autotestUrl,
    });
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: BEFORE,
      afterText: specFile([...OLD_TESTS, wrong]),
      changes: [
        specChanged,
        {
          status: 'new',
          path: 'ketcher-autotests/tests/test-data/KET/Bugs/zoom.ket',
        },
      ],
    });
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.warnings, [
      '1 new tests for 2 bugs.',
      'Case 26, epam/ketcher#9109: the title does not start with "Case 26 — "; there is no "Bug: https://github.com/epam/ketcher/issues/9109" line; there is no "Version 3.15.0" line.',
      'No test for epam/indigo#3577, Case 27.',
      'New test-data files outside <Format>/Chromium-popup/Bugs/ketcher-3.15.0-bugs/: ketcher-autotests/tests/test-data/KET/Bugs/zoom.ket.',
    ]);
  });

  it('checks a new file without old tests', () => {
    const fresh = specFile(
      NEW_TESTS.map((test, index) =>
        test.replace(/Case 2\d/, `Case ${index + 1}`),
      ),
    );
    const result = checkBugSpec({
      ticket: TICKET,
      beforeText: '',
      afterText: fresh,
      changes: [{ status: 'new', path: SPEC_PATH }],
    });
    assert.deepEqual(result.errors, []);
    assert.deepEqual(result.warnings, []);
  });
});

describe('formatReport and formatPlan', () => {
  it('lists failed checks before passed ones', () => {
    assert.equal(
      formatReport({ errors: ['E'], warnings: ['W'], passed: ['P'] }),
      'Checks of the bug tests:\n\n- ✗ E\n- ✗ W\n- ✓ P',
    );
  });

  it('gives each bug its prefix', () => {
    assert.equal(
      formatPlan(TICKET, ['Case 26 — ', 'Case 27 — ']),
      '- Case 26 — <description> for epam/ketcher#9109\n- Case 27 — <description> for epam/indigo#3577',
    );
  });
});
