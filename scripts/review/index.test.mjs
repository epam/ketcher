import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { test } from 'node:test';
import { parseCommandLine } from './index.mjs';

test('the command line gives the settings of a run', () => {
  const settings = parseCommandLine(
    ['--pr', '12533', '--dry-run', '--finder-model', 'f', '--pr-dir', '../pr'],
    { GITHUB_REPOSITORY: 'someone/ketcher' },
  );
  assert.equal(settings.prNumber, 12533);
  assert.equal(settings.repo, 'someone/ketcher');
  assert.equal(settings.dryRun, true);
  assert.deepEqual(settings.flags, {
    finderModel: 'f',
    verifierModel: undefined,
  });
  assert.equal(settings.prDir, resolve('../pr'));
  assert.equal(settings.baseDir, resolve('.'));
  assert.equal(settings.logPath, 'review-run.json');
});

test('a run without a pull request number does not start', () => {
  assert.throws(() => parseCommandLine([]), /--pr <number> is required/);
  assert.throws(() => parseCommandLine(['--pr', 'abc']), /--pr <number>/);
});

test('an unknown option does not start a run', () => {
  assert.throws(
    () => parseCommandLine(['--pr', '1', '--dryrun']),
    /Unknown option/,
  );
});