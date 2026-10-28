// Runs scripts/pr-checks.mjs on a pull request (.github/workflows/danger.yml).
// The workflow runs on pull_request_target with the base branch checked out,
// so this file and the rules come from the base, never from the PR. Everything
// about the PR is read through the GitHub API.
import { danger, fail, schedule, warn } from 'danger';
import { readFileSync } from 'node:fs';
import { checkPullRequest } from './scripts/pr-checks.mjs';

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
  const { pr, api, thisPR } = danger.github;
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

  const findings = checkPullRequest({
    title: pr.title,
    body: pr.body ?? '',
    branch: pr.head.ref,
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
