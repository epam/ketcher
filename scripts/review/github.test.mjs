import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGitHub } from './github.mjs';

/**
 * A fake execa: records each call and answers with the stdout that the first
 * matching rule gives. A rule matches when the joined arguments include its
 * text.
 * @param {[string, object][]} rules [text, result]
 */
function fakeExec(rules = []) {
  const calls = [];
  const exec = async (command, args, options = {}) => {
    calls.push({ command, args, options });
    const joined = args.join(' ');
    const rule = rules.find(([text]) => joined.includes(text));
    return { exitCode: 0, stdout: '', ...rule?.[1] };
  };
  return { exec, calls };
}

const json = (value) => ({ stdout: JSON.stringify(value) });

const github = (rules) => {
  const fake = fakeExec(rules);
  const gh = createGitHub({
    repo: 'epam/ketcher',
    prDir: '/pr',
    exec: fake.exec,
  });
  return { gh, calls: fake.calls };
};

test('the pull request gives its title, body, commits and labels', async () => {
  const { gh, calls } = github([
    [
      'repos/epam/ketcher/pulls/7',
      json({
        number: 7,
        title: '#1 - Fix undo',
        body: null,
        base: { sha: 'b'.repeat(40) },
        head: { sha: 'h'.repeat(40) },
        labels: [{ name: 'Run Claude Review' }],
      }),
    ],
  ]);
  assert.deepEqual(await gh.pullRequest(7), {
    number: 7,
    title: '#1 - Fix undo',
    body: '',
    baseSha: 'b'.repeat(40),
    headSha: 'h'.repeat(40),
    labels: ['Run Claude Review'],
  });
  assert.deepEqual(calls[0].args, ['api', 'repos/epam/ketcher/pulls/7']);
});

test('linked issues come from the same query as Danger, with their type', async () => {
  const nodes = [
    { number: 12, issueType: { name: 'Bug' } },
    { number: 13, issueType: null },
  ];
  const { gh, calls } = github([
    [
      'graphql',
      json({
        data: {
          repository: { pullRequest: { closingIssuesReferences: { nodes } } },
        },
      }),
    ],
  ]);
  assert.deepEqual(await gh.linkedIssues(7), [
    { number: 12, type: 'Bug' },
    { number: 13, type: null },
  ]);
  const args = calls[0].args;
  assert.ok(args.includes('number=7'));
  assert.ok(args.includes('owner=epam'));
  assert.ok(args.some((arg) => arg.includes('closingIssuesReferences')));
});

test('comments of every page come back as one list', async () => {
  const { gh, calls } = github([
    ['issues/7/comments', json([[{ id: 1 }, { id: 2 }], [{ id: 3 }]])],
  ]);
  const comments = await gh.comments(7);
  assert.deepEqual(
    comments.map((comment) => comment.id),
    [1, 2, 3],
  );
  assert.ok(calls[0].args.includes('--paginate'));
  assert.ok(calls[0].args.includes('--slurp'));
});

test('a review posts the inline comments on the new side of the diff', async () => {
  const { gh, calls } = github();
  await gh.postReview(7, {
    commitId: 'h'.repeat(40),
    comments: [{ path: 'src/a.ts', line: 3, body: 'Body.' }],
  });
  assert.deepEqual(calls[0].args, [
    'api',
    '--method',
    'POST',
    'repos/epam/ketcher/pulls/7/reviews',
    '--input',
    '-',
  ]);
  assert.deepEqual(JSON.parse(calls[0].options.input), {
    commit_id: 'h'.repeat(40),
    event: 'COMMENT',
    comments: [{ path: 'src/a.ts', line: 3, side: 'RIGHT', body: 'Body.' }],
  });
});

test('a review without comments posts nothing', async () => {
  const { gh, calls } = github();
  await gh.postReview(7, { commitId: 'h'.repeat(40), comments: [] });
  assert.equal(calls.length, 0);
});

test('the brief is sent as JSON on stdin, not as an argument', async () => {
  const { gh, calls } = github();
  const body = '<!-- marker -->\n## Brief with `code` and "quotes"';
  await gh.postComment(7, body);
  assert.ok(!calls[0].args.some((arg) => arg.includes('Brief')));
  assert.deepEqual(JSON.parse(calls[0].options.input), { body });
});

test('removing a label encodes its name and never throws', async () => {
  const { gh, calls } = github();
  await gh.removeLabel(7, 'Claude Review: Opus');
  assert.deepEqual(calls[0].args, [
    'api',
    '--method',
    'DELETE',
    'repos/epam/ketcher/issues/7/labels/Claude%20Review%3A%20Opus',
  ]);
  assert.equal(calls[0].options.reject, false);
});

test('git runs in the pull request checkout', async () => {
  const { gh, calls } = github([
    ['merge-base B H', { stdout: 'M\n' }],
    ['--is-ancestor', { exitCode: 1 }],
  ]);
  await gh.diff('B', 'H');
  assert.equal(await gh.mergeBase('B', 'H'), 'M');
  assert.equal(await gh.isAncestor('P', 'H'), false);
  for (const call of calls) {
    assert.equal(call.command, 'git');
    assert.deepEqual(call.args.slice(0, 2), ['-C', '/pr']);
  }
  assert.deepEqual(calls[0].args.slice(2), [
    'diff',
    '--no-color',
    '--no-ext-diff',
    '--find-renames',
    'B',
    'H',
  ]);
});