import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createGitHub, githubToken } from './github.mjs';

/**
 * A fake Octokit: each method records its parameters and answers with the
 * data given for it.
 * @param {Record<string, unknown>} answers data per method name
 */
function fakeOctokit(answers = {}) {
  const calls = [];
  const method = (name) => async (params) => {
    calls.push({ name, params });
    const answer = answers[name];
    if (answer instanceof Error) {
      throw answer;
    }
    return { data: answer };
  };
  const octokit = {
    rest: {
      pulls: { get: method('pulls.get'), createReview: method('createReview') },
      issues: {
        get: method('issues.get'),
        listComments: 'issues.listComments',
        createComment: method('createComment'),
        removeLabel: method('removeLabel'),
      },
    },
    async paginate(endpoint, params) {
      calls.push({ name: `paginate ${endpoint}`, params });
      return answers[endpoint];
    },
    async graphql(query, variables) {
      calls.push({ name: 'graphql', params: { query, ...variables } });
      return answers.graphql;
    },
  };
  return { octokit, calls };
}

/** A fake execa for git: answers by a text in the arguments. */
function fakeExec(rules = []) {
  const calls = [];
  const exec = async (command, args, options = {}) => {
    calls.push({ command, args, options });
    const rule = rules.find(([text]) => args.join(' ').includes(text));
    return { exitCode: 0, stdout: '', ...rule?.[1] };
  };
  return { exec, calls };
}

const github = (answers, rules) => {
  const fake = fakeOctokit(answers);
  const git = fakeExec(rules);
  const gh = createGitHub({
    repo: 'epam/ketcher',
    prDir: '/pr',
    octokit: fake.octokit,
    exec: git.exec,
  });
  return { gh, calls: fake.calls, gitCalls: git.calls };
};

test('the pull request gives its title, body, commits and labels', async () => {
  const { gh, calls } = github({
    'pulls.get': {
      number: 7,
      title: '#1 - Fix undo',
      body: null,
      base: { sha: 'b'.repeat(40) },
      head: { sha: 'h'.repeat(40) },
      labels: [{ name: 'Run Claude Review' }],
    },
  });
  assert.deepEqual(await gh.pullRequest(7), {
    number: 7,
    title: '#1 - Fix undo',
    body: '',
    baseSha: 'b'.repeat(40),
    headSha: 'h'.repeat(40),
    labels: ['Run Claude Review'],
  });
  assert.deepEqual(calls[0].params, {
    owner: 'epam',
    repo: 'ketcher',
    pull_number: 7,
  });
});

test('linked issues come from the same query as Danger, with their type', async () => {
  const nodes = [
    { number: 12, issueType: { name: 'Bug' } },
    { number: 13, issueType: null },
  ];
  const { gh, calls } = github({
    graphql: {
      repository: { pullRequest: { closingIssuesReferences: { nodes } } },
    },
  });
  assert.deepEqual(await gh.linkedIssues(7), [
    { number: 12, type: 'Bug' },
    { number: 13, type: null },
  ]);
  const { query, ...variables } = calls[0].params;
  assert.ok(query.includes('closingIssuesReferences'));
  assert.deepEqual(variables, { owner: 'epam', repo: 'ketcher', number: 7 });
});

test('comments of every page come back as one list', async () => {
  const { gh, calls } = github({
    'issues.listComments': [{ id: 1 }, { id: 2 }, { id: 3 }],
  });
  const comments = await gh.comments(7);
  assert.equal(comments.length, 3);
  assert.equal(calls[0].name, 'paginate issues.listComments');
  assert.equal(calls[0].params.issue_number, 7);
});

test('a review posts the inline comments on the new side of the diff', async () => {
  const { gh, calls } = github();
  await gh.postReview(7, {
    commitId: 'h'.repeat(40),
    comments: [{ path: 'src/a.ts', line: 3, body: 'Body.' }],
  });
  assert.deepEqual(calls[0].params, {
    owner: 'epam',
    repo: 'ketcher',
    pull_number: 7,
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

test('the brief is posted as a top-level comment', async () => {
  const { gh, calls } = github();
  await gh.postComment(7, '## Brief');
  assert.deepEqual(calls[0], {
    name: 'createComment',
    params: {
      owner: 'epam',
      repo: 'ketcher',
      issue_number: 7,
      body: '## Brief',
    },
  });
});

test('a label that is already gone is not an error, other errors are', async () => {
  const gone = Object.assign(new Error('Not Found'), { status: 404 });
  await github({ removeLabel: gone }).gh.removeLabel(7, 'Claude Review: Opus');

  const denied = Object.assign(new Error('Forbidden'), { status: 403 });
  await assert.rejects(
    github({ removeLabel: denied }).gh.removeLabel(7, 'Run Claude Review'),
    /Forbidden/,
  );
});

test('git runs in the pull request checkout', async () => {
  const { gh, gitCalls } = github({}, [
    ['merge-base B H', { stdout: 'M\n' }],
    ['--is-ancestor', { exitCode: 1 }],
  ]);
  await gh.diff('B', 'H');
  assert.equal(await gh.mergeBase('B', 'H'), 'M');
  assert.equal(await gh.isAncestor('P', 'H'), false);
  for (const call of gitCalls) {
    assert.equal(call.command, 'git');
    assert.deepEqual(call.args.slice(0, 2), ['-C', '/pr']);
  }
});

test('the token comes from the environment, or else from the gh login', async () => {
  const { exec, calls } = fakeExec([['auth token', { stdout: 'local\n' }]]);
  assert.equal(await githubToken({ env: { GITHUB_TOKEN: 'ci' }, exec }), 'ci');
  assert.equal(calls.length, 0);
  assert.equal(await githubToken({ env: {}, exec }), 'local');
  assert.deepEqual(calls[0].args, ['auth', 'token']);
});
