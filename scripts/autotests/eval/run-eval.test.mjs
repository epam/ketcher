import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import {
  analyzeSpec,
  buildPrompt,
  combineRuns,
  CONFIGS,
  eslintCounts,
  firstLine,
  accountFailure,
  insideCheckout,
  modelArgs,
  modelEnv,
  parseCommandLine,
  parseModelOutput,
  playwrightTests,
  promptTemplate,
  selectEntries,
  tscErrors,
} from './run-eval.mjs';

const WORKFLOW = new URL(
  '../../../.github/workflows/claude-implement-autotests.yml',
  import.meta.url,
);
const SET = JSON.parse(
  readFileSync(new URL('./eval-set.json', import.meta.url), 'utf8'),
);

const ENTRY = {
  issue: 10016,
  title: 'Autotests: Rename',
  url: 'https://github.com/epam/ketcher/issues/10016',
  specFileName: '8792-Rename.spec.ts',
  version: '3.12.0',
  checklist: 2,
  body: 'Source task(s): https://github.com/epam/ketcher/issues/8792\n- [ ] one\n- [ ] two',
};

describe('parseCommandLine', () => {
  it('runs every configuration and issue by default', () => {
    const settings = parseCommandLine([]);
    assert.deepEqual(
      settings.configs.map((c) => c.name),
      CONFIGS.map((c) => c.name),
    );
    assert.equal(settings.issues, undefined);
    assert.equal(settings.runs, 3);
  });

  it('picks configurations and issues', () => {
    const settings = parseCommandLine([
      '--config',
      'opus',
      '--issue',
      '10016,10018',
    ]);
    assert.deepEqual(
      settings.configs.map((c) => c.name),
      ['opus'],
    );
    assert.deepEqual(settings.issues, [10016, 10018]);
  });

  it('refuses an unknown configuration, a bad issue and a bad run count', () => {
    assert.throws(
      () => parseCommandLine(['--config', 'haiku']),
      /Unknown configuration: haiku/,
    );
    assert.throws(() => parseCommandLine(['--issue', 'x']), /issue numbers/);
    assert.throws(() => parseCommandLine(['--runs', '0']), /positive/);
    assert.throws(() => parseCommandLine(['--nope']));
  });
});

describe('selectEntries', () => {
  const set = { entries: [{ issue: 1 }, { issue: 2 }] };
  it('returns the chosen entries, or all', () => {
    assert.deepEqual(selectEntries(set, [2]), [{ issue: 2 }]);
    assert.equal(selectEntries(set, undefined).length, 2);
  });
  it('refuses an issue outside the set', () => {
    assert.throws(() => selectEntries(set, [3]), /Not in the eval set: 3/);
  });
});

describe('the eval set', () => {
  it('has the fields the run needs for every entry', () => {
    assert.match(SET.base, /^[0-9a-f]{40}$/);
    for (const entry of SET.entries) {
      assert.ok(entry.body.includes('Source task(s):'), `#${entry.issue}`);
      assert.match(entry.version, /^\d+\.\d+\.\d+$/);
      assert.ok(entry.specFileName.startsWith(`${entry.feature}-`));
      assert.ok(entry.checklist > 0);
      assert.ok(entry.reference.specs.length > 0);
      for (const spec of entry.reference.specs) {
        assert.ok(
          entry.reference.remove.includes(spec),
          `#${entry.issue} removes ${spec}`,
        );
      }
    }
  });
});

describe('promptTemplate and buildPrompt', () => {
  const workflow = `jobs:
  x:
    steps:
      - uses: a
        with:
          prompt: |
            Kind: \${{ steps.issue.outputs.kind }}
            URL: \${{ github.event.issue.html_url }}

            DETAILS:
            \${{ steps.issue.outputs.issue_body }}

      - name: next
`;

  it('reads the prompt block without its indentation', () => {
    assert.equal(
      promptTemplate(workflow),
      'Kind: ${{ steps.issue.outputs.kind }}\nURL: ${{ github.event.issue.html_url }}\n\nDETAILS:\n${{ steps.issue.outputs.issue_body }}\n',
    );
  });

  it('fills the expressions as the workflow does for a feature', () => {
    const prompt = buildPrompt(promptTemplate(workflow), ENTRY);
    assert.equal(
      prompt,
      `Kind: feature\nURL: ${ENTRY.url}\n\nDETAILS:\n${ENTRY.body}\n`,
    );
  });

  it('refuses an expression it does not know', () => {
    assert.throws(
      () => buildPrompt('${{ secrets.TOKEN }}', ENTRY),
      /Unknown expression in the workflow prompt: secrets.TOKEN/,
    );
  });

  it('fills every expression of the real workflow prompt', () => {
    const prompt = buildPrompt(
      promptTemplate(readFileSync(WORKFLOW, 'utf8')),
      ENTRY,
    );
    assert.ok(!prompt.includes('${{'));
    assert.ok(prompt.includes('generate-autotests'));
    assert.ok(prompt.includes(`SPEC_FILE_NAME: ${ENTRY.specFileName}`));
    assert.ok(prompt.includes(`KETCHER_VERSION: ${ENTRY.version}`));
  });
});

describe('modelArgs and modelEnv', () => {
  it('gives the tools of the workflow and refuses the rest', () => {
    const args = modelArgs('claude-opus-5-5');
    assert.ok(args.includes('--restricted'));
    assert.equal(
      args[args.indexOf('--tools') + 1],
      'Read,Glob,Grep,Edit,Write',
    );
    assert.equal(args[args.indexOf('--permission-mode') + 1], 'dontAsk');
    assert.equal(args[args.indexOf('--model') + 1], 'claude-opus-5-5');
    assert.ok(args.includes('Write(ketcher-autotests/**)'));
    const denied = args.slice(args.indexOf('--disallowedTools') + 1);
    assert.ok(denied.includes('Bash'));
  });

  it('the workflow allows the same tools', () => {
    const workflow = readFileSync(WORKFLOW, 'utf8');
    assert.match(
      workflow,
      /--allowedTools "Read" "Glob" "Grep" "Edit\(ketcher-autotests\/\*\*\)" "Write\(ketcher-autotests\/\*\*\)"/,
    );
  });

  it('hides the session markers and the GitHub tokens', () => {
    const env = modelEnv({
      CLAUDECODE: '1',
      GH_TOKEN: 't',
      GITHUB_TOKEN: 't',
      PATH: '/bin',
    });
    assert.deepEqual(env, { PATH: '/bin' });
  });
});

describe('parseModelOutput', () => {
  const run = (data, exitCode = 0) =>
    parseModelOutput({
      exitCode,
      stdout: JSON.stringify(data),
      stderr: '',
      durationMs: 5,
    });

  it('reads cost, time and turns of a good run', () => {
    const result = run({
      subtype: 'success',
      total_cost_usd: 1.5,
      duration_ms: 1000,
      num_turns: 12,
      modelUsage: { 'claude-sonnet-5-5': {} },
    });
    assert.deepEqual(result, {
      ok: true,
      costUsd: 1.5,
      durationMs: 1000,
      turns: 12,
      models: ['claude-sonnet-5-5'],
    });
  });

  it('stops on a login failure', () => {
    const loggedOut = run({
      subtype: 'success',
      is_error: true,
      api_error_status: 401,
      result: 'Not logged in',
    });
    assert.ok(accountFailure(loggedOut));
  });

  it('reports a failed run and the usage limit', () => {
    const limited = run({
      subtype: 'success',
      is_error: true,
      api_error_status: 429,
      result: 'limit',
    });
    assert.equal(limited.ok, false);
    assert.ok(accountFailure(limited));
    assert.match(
      run({ subtype: 'error_max_budget_usd' }).error,
      /error_max_budget_usd/,
    );
    const garbage = parseModelOutput({
      exitCode: 1,
      stdout: 'x',
      stderr: 'boom',
      durationMs: 7,
    });
    assert.equal(garbage.ok, false);
    assert.equal(garbage.durationMs, 7);
    assert.ok(!accountFailure(garbage));
  });
});

describe('analyzeSpec', () => {
  const spec = `
/*
 * Test task: ${ENTRY.url}
 * Version 3.12.0
 */
test('Case 1 - first', async () => {
  await page.getByTestId('x').click();
});
/*
 * Test task: https://github.com/epam/ketcher/issues/1
 * Version 3.11.0
 */
test.skip('Case 2 - second', async () => {});
`;

  it('counts the tests, the skips and the comment-block mistakes', () => {
    const result = analyzeSpec(spec, ENTRY);
    assert.equal(result.testCount, 2);
    assert.equal(result.skipCount, 1);
    assert.equal(result.casesMatchChecklist, true);
    assert.equal(result.versionLines, 2);
    assert.equal(result.wrongVersionLines, 1);
    assert.equal(result.wrongTestTaskLines, 1);
    assert.equal(result.rawSelectors, 1);
  });

  it('sees cases that do not follow the checklist', () => {
    assert.equal(
      analyzeSpec(spec, { ...ENTRY, checklist: 3 }).casesMatchChecklist,
      false,
    );
  });
});

describe('tscErrors and eslintCounts', () => {
  it('keeps the type errors of the given files only', () => {
    const output = [
      'tests/specs/a.spec.ts(3,1): error TS2304: Cannot find name x.',
      'tests/specs/b.spec.ts(1,1): error TS2304: Cannot find name y.',
      'other line',
    ].join('\n');
    assert.deepEqual(tscErrors(output, ['tests/specs/a.spec.ts']), [
      'tests/specs/a.spec.ts(3,1): error TS2304: Cannot find name x.',
    ]);
  });

  it('counts eslint errors and warnings', () => {
    const output = JSON.stringify([
      {
        messages: [
          { severity: 2, ruleId: 'no-x' },
          { severity: 1, ruleId: 'no-y' },
        ],
      },
    ]);
    assert.deepEqual(eslintCounts(output), {
      errors: 1,
      warnings: 1,
      rules: ['no-x', 'no-y'],
    });
    assert.equal(eslintCounts('not json').errors, -1);
  });
});

describe('playwrightTests and combineRuns', () => {
  const report = (status) => ({
    suites: [
      {
        title: 'a.spec.ts',
        specs: [],
        suites: [
          {
            title: 'Feature',
            specs: [
              {
                title: 'Case 1',
                tests: [{ status: 'expected', results: [{ status }] }],
              },
              { title: 'Case 2', tests: [{ status: 'skipped', results: [] }] },
            ],
          },
        ],
      },
    ],
    errors: [],
  });

  it('lists each test with its status', () => {
    assert.deepEqual(playwrightTests(report('passed')).tests, [
      { title: 'Feature > Case 1', status: 'passed', error: undefined },
      { title: 'Feature > Case 2', status: 'skipped', error: undefined },
    ]);
  });

  it('gives the load errors of a spec that did not run', () => {
    const parsed = playwrightTests({
      suites: [],
      errors: [{ message: 'SyntaxError\nmore' }],
    });
    assert.deepEqual(parsed, { tests: [], errors: ['SyntaxError'] });
  });

  it('marks a test that passed in some runs only as flaky', () => {
    const runs = [report('passed'), report('failed'), report('passed')].map(
      playwrightTests,
    );
    const combined = combineRuns(runs);
    assert.equal(combined.flaky, 1);
    assert.equal(combined.skipped, 1);
    assert.equal(combined.passed, 0);
  });

  it('marks a test that passed in every run as passed', () => {
    const combined = combineRuns(
      [report('passed'), report('passed')].map(playwrightTests),
    );
    assert.equal(combined.passed, 1);
    assert.equal(combined.failed, 0);
  });
});

describe('insideCheckout', () => {
  it('refuses a path that leaves the checkout', () => {
    assert.equal(
      insideCheckout('/w/c', 'ketcher-autotests/a'),
      '/w/c/ketcher-autotests/a',
    );
    assert.throws(() => insideCheckout('/w/c', '../x'), /leaves the checkout/);
    assert.throws(() => insideCheckout('/w/c', ''), /leaves the checkout/);
  });
});

describe('firstLine', () => {
  it('drops the colour codes and the lines after the first', () => {
    assert.equal(
      firstLine('Error: \u001b[2mexpect(\u001b[22mreceived)\nmore'),
      'Error: expect(received)',
    );
    assert.equal(firstLine(undefined), undefined);
  });
});
