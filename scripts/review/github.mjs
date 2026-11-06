// Everything the hub reads from or writes to GitHub and the pull request
// checkout. Only the hub calls this module: no model run gets a tool that
// writes to GitHub. Commands run without a shell, through `gh` and `git`;
// tests pass a fake `exec`.

import { execa } from 'execa';

/**
 * The pull request fields the hub uses.
 * @typedef {object} PullRequest
 * @property {number} number
 * @property {string} title
 * @property {string} body
 * @property {string} baseSha
 * @property {string} headSha
 * @property {string[]} labels
 */

/**
 * An issue that the pull request closes, with its GitHub issue type.
 * @typedef {{ number: number, type: string | null }} LinkedIssueRef
 */

/** The same query as dangerfile.ts, so the hub and Danger agree on the link. */
const LINKED_ISSUES = `
  query ($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        closingIssuesReferences(first: 20) {
          nodes { number issueType { name } }
        }
      }
    }
  }`;

/**
 * One inline comment as the reviews API takes it: on the new side of the
 * diff, at a line the diff changes.
 * @param {{ path: string, line: number, body: string }} comment
 */
const reviewComment = ({ path, line, body }) => ({
  path,
  line,
  side: 'RIGHT',
  body,
});

/**
 * The GitHub and git calls of one review run.
 * @param {object} options
 * @param {string} options.repo `owner/name`
 * @param {string} options.prDir the pull request checkout, for git
 * @param {typeof execa} [options.exec] replaced in tests
 */
export function createGitHub({ repo, prDir, exec = execa }) {
  const [owner, name] = repo.split('/');
  const base = `repos/${owner}/${name}`;

  /** Runs `gh api` and parses its JSON answer. */
  const api = async (args, body) => {
    const input = body === undefined ? undefined : JSON.stringify(body);
    const { stdout } = await exec('gh', ['api', ...args], { input });
    return stdout === '' ? undefined : JSON.parse(stdout);
  };

  /** Sends a JSON body with the given method. */
  const send = (method, path, body) =>
    api(['--method', method, path, '--input', '-'], body);

  /** Runs git in the pull request checkout. */
  const git = async (args) => {
    const { stdout } = await exec('git', ['-C', prDir, ...args]);
    return stdout;
  };

  return {
    /**
     * @param {number} number
     * @returns {Promise<PullRequest>}
     */
    async pullRequest(number) {
      const pr = await api([`${base}/pulls/${number}`]);
      return {
        number: pr.number,
        title: pr.title,
        body: pr.body ?? '',
        baseSha: pr.base.sha,
        headSha: pr.head.sha,
        labels: pr.labels.map((label) => label.name),
      };
    },

    /**
     * The issues the pull request closes, as Danger reads them.
     * @param {number} number
     * @returns {Promise<LinkedIssueRef[]>}
     */
    async linkedIssues(number) {
      const data = await api([
        'graphql',
        '-f',
        `query=${LINKED_ISSUES}`,
        '-F',
        `owner=${owner}`,
        '-F',
        `repo=${name}`,
        '-F',
        `number=${number}`,
      ]);
      const nodes =
        data.data.repository.pullRequest.closingIssuesReferences.nodes;
      return nodes.map((issue) => ({
        number: issue.number,
        type: issue.issueType?.name ?? null,
      }));
    },

    /**
     * @param {number} number
     * @returns {Promise<{ number: number, title: string, body: string }>}
     */
    async issue(number) {
      const issue = await api([`${base}/issues/${number}`]);
      return {
        number: issue.number,
        title: issue.title,
        body: issue.body ?? '',
      };
    },

    /**
     * Every top-level comment of the pull request, all pages.
     * @param {number} number
     */
    async comments(number) {
      const pages = await api([
        '--paginate',
        '--slurp',
        `${base}/issues/${number}/comments`,
      ]);
      return pages.flat();
    },

    /**
     * Posts one review with the inline comments. Without comments it posts
     * nothing, since the brief carries the rest.
     * @param {number} number
     * @param {{ commitId: string, comments: { path: string, line: number, body: string }[] }} review
     */
    async postReview(number, { commitId, comments }) {
      if (comments.length === 0) {
        return;
      }
      await send('POST', `${base}/pulls/${number}/reviews`, {
        commit_id: commitId,
        event: 'COMMENT',
        comments: comments.map(reviewComment),
      });
    },

    /**
     * Posts one top-level comment, such as the brief.
     * @param {number} number
     * @param {string} body
     */
    async postComment(number, body) {
      await send('POST', `${base}/issues/${number}/comments`, { body });
    },

    /**
     * Removes a label. A label that is already gone is not an error.
     * @param {number} number
     * @param {string} label
     */
    async removeLabel(number, label) {
      const path = `${base}/issues/${number}/labels/${encodeURIComponent(label)}`;
      await exec('gh', ['api', '--method', 'DELETE', path], { reject: false });
    },

    /**
     * The diff between two commits of the checkout.
     * @param {string} from
     * @param {string} to
     */
    diff(from, to) {
      return git([
        'diff',
        '--no-color',
        '--no-ext-diff',
        '--find-renames',
        from,
        to,
      ]);
    },

    /**
     * The commit where the pull request branched from its base.
     * @param {string} baseSha
     * @param {string} headSha
     */
    async mergeBase(baseSha, headSha) {
      return (await git(['merge-base', baseSha, headSha])).trim();
    },

    /**
     * Whether `ancestor` is in the history of `commit`. False after a force
     * push that dropped it.
     * @param {string} ancestor
     * @param {string} commit
     */
    async isAncestor(ancestor, commit) {
      const result = await exec(
        'git',
        ['-C', prDir, 'merge-base', '--is-ancestor', ancestor, commit],
        { reject: false },
      );
      return result.exitCode === 0;
    },
  };
}