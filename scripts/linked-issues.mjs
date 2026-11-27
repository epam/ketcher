// The issues a pull request closes, read the same way by Danger
// (dangerfile.ts) and the review hub (scripts/review/github.mjs). REST has no
// field for them, so both ask GraphQL with this one query.

/**
 * An issue that the pull request closes, with its GitHub issue type.
 * @typedef {{ number: number, type: string | null }} LinkedIssueRef
 * @typedef {{
 *   repository: {
 *     pullRequest: {
 *       closingIssuesReferences: {
 *         nodes: { number: number, issueType: { name: string } | null }[],
 *       },
 *     },
 *   },
 * }} LinkedIssuesResponse
 */

/** Variables: `owner`, `repo` and the pull request `number`. */
export const LINKED_ISSUES_QUERY = `
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
 * The linked issues from the answer to LINKED_ISSUES_QUERY. An issue
 * without a type gets `null`.
 * @param {LinkedIssuesResponse} data
 * @returns {LinkedIssueRef[]}
 */
export function linkedIssueRefs(data) {
  return data.repository.pullRequest.closingIssuesReferences.nodes.map(
    (issue) => ({
      number: issue.number,
      type: issue.issueType?.name ?? null,
    }),
  );
}
