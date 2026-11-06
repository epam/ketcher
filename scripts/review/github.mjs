// Everything the hub reads from or writes to GitHub and the pull request
// checkout. Only the hub calls this module: no model run gets a tool that
// writes to GitHub. GitHub calls go through Octokit, git calls through execa
// without a shell; tests pass fakes for both.

import { Octokit } from '@octokit/rest';
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

/**
 * The same query as dangerfile.ts, so the hub and Danger agree on the link.
 * REST has no field for the issues a pull request closes.
 */
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
 * The token for the GitHub API: GITHUB_TOKEN in CI, or the token of the
 * local `gh` login, so a dry run needs no extra setup.
 * @param {object} [options]
 * @param {NodeJS.ProcessEnv} [options.env]
 * @param {typeof execa} [options.exec]
 */
export async function githubToken({ env = process.env, exec = execa } = {}) {
  const fromEnv = env.GITHUB_TOKEN ?? env.GH_TOKEN;
  if (fromEnv) {
    return fromEnv;
  }
  const { stdout } = await exec('gh', ['auth', 'token']);
  return stdout.trim();
}

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
 * @param {Octokit} [options.octokit] replaced in tests
 * @param {string} [options.token] used when no octokit is given
 * @param {typeof execa} [options.exec] replaced in tests
 */
export function createGitHub({
  repo: fullName,
  prDir,
  token,
  octokit = new Octokit({ auth: token }),
  exec = execa,
}) {
  const [owner, repo] = fullName.split('/');

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
      const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: number,
      });
      return {
        number: data.number,
        title: data.title,
        body: data.body ?? '',
        baseSha: data.base.sha,
        headSha: data.head.sha,
        labels: data.labels.map((label) => label.name),
      };
    },

    /**
     * The issues the pull request closes, as Danger reads them.
     * @param {number} number
     * @returns {Promise<LinkedIssueRef[]>}
     */
    async linkedIssues(number) {
      const data = await octokit.graphql(LINKED_ISSUES, {
        owner,
        repo,
        number,
      });
      const { nodes } = data.repository.pullRequest.closingIssuesReferences;
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
      const { data } = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number: number,
      });
      return { number: data.number, title: data.title, body: data.body ?? '' };
    },

    /**
     * Every top-level comment of the pull request, all pages.
     * @param {number} number
     */
    comments(number) {
      return octokit.paginate(octokit.rest.issues.listComments, {
        owner,
        repo,
        issue_number: number,
        per_page: 100,
      });
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
      await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: number,
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
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body,
      });
    },

    /**
     * Removes a label. A label that is already gone is not an error.
     * @param {number} number
     * @param {string} label
     */
    async removeLabel(number, label) {
      try {
        await octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: number,
          name: label,
        });
      } catch (error) {
        if (error.status !== 404) {
          throw error;
        }
      }
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