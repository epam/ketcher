// Runs scripts/pr-checks.mjs on a pull request (.github/workflows/danger.yml).
// The workflow runs on pull_request_target with the base branch checked out,
// so this file and the rules come from the base, never from the PR. Everything
// about the PR is read through the GitHub API.
import { danger, fail, schedule, warn } from 'danger';
import { readFileSync } from 'node:fs';
import { checkPullRequest, MAX_FILE_LINES } from './scripts/pr-checks.mjs';

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

interface LinkedIssuesResponse {
  repository: {
    pullRequest: {
      closingIssuesReferences: {
        nodes: { number: number; issueType: { name: string } | null }[];
      };
    };
  };
}

schedule(async () => {
  const { api, thisPR } = danger.github;
  // Danger's PR type omits the reviewer lists that GitHub sends.
  const pr = danger.github.pr as typeof danger.github.pr & {
    requested_reviewers?: unknown[];
    requested_teams?: unknown[];
  };
  const { owner, repo } = thisPR;

  const files = await api.paginate(api.rest.pulls.listFiles, {
    owner,
    repo,
    pull_number: pr.number,
    per_page: 100,
  });
  const linked = await api.graphql<LinkedIssuesResponse>(LINKED_ISSUES, {
    owner,
    repo,
    number: pr.number,
  });

  // R16 needs the line count after the change. Read it only for source files
  // that grow, since a file that shrinks cannot cross the limit.
  const lineCounts = new Map<string, number>();
  for (const file of files) {
    const grows = file.additions > file.deletions;
    if (
      !/^packages\/[^/]+\/src\//.test(file.filename) ||
      file.status === 'removed' ||
      !grows
    ) {
      continue;
    }
    const { data } = await api.rest.repos.getContent({
      owner,
      repo,
      path: file.filename,
      ref: pr.head.sha,
    });
    if (!Array.isArray(data) && data.type === 'file' && data.content) {
      const text = Buffer.from(data.content, 'base64').toString('utf8');
      const lines = text.split('\n').length - (text.endsWith('\n') ? 1 : 0);
      if (lines > MAX_FILE_LINES) lineCounts.set(file.filename, lines);
    }
  }

  const findings = checkPullRequest({
    title: pr.title,
    body: pr.body ?? '',
    branch: pr.head.ref,
    isDraft: pr.draft ?? false,
    requestedReviewers:
      (pr.requested_reviewers?.length ?? 0) + (pr.requested_teams?.length ?? 0),
    labels: danger.github.issue.labels.map((label) => label.name),
    linkedIssues:
      linked.repository.pullRequest.closingIssuesReferences.nodes.map(
        (issue) => ({
          number: issue.number,
          type: issue.issueType?.name ?? null,
        }),
      ),
    files: files.map((file) => ({
      path: file.filename,
      status: file.status,
      additions: file.additions,
      deletions: file.deletions,
      lines: lineCounts.get(file.filename),
    })),
    lscTemplate: readFileSync(
      '.github/PULL_REQUEST_TEMPLATE/large-scale-change.md',
      'utf8',
    ),
  });

  for (const finding of findings) {
    (finding.level === 'fail' ? fail : warn)(finding.message);
  }
});
