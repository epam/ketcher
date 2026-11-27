import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LINKED_ISSUES_QUERY, linkedIssueRefs } from './linked-issues.mjs';

const answer = (nodes) => ({
  repository: { pullRequest: { closingIssuesReferences: { nodes } } },
});

test('each linked issue keeps its number and its type name', () => {
  const refs = linkedIssueRefs(
    answer([
      { number: 12, issueType: { name: 'Bug' } },
      { number: 13, issueType: null },
    ]),
  );
  assert.deepEqual(refs, [
    { number: 12, type: 'Bug' },
    { number: 13, type: null },
  ]);
});

test('a pull request that closes nothing has no linked issues', () => {
  assert.deepEqual(linkedIssueRefs(answer([])), []);
});

test('the query asks for the fields the mapping reads', () => {
  assert.match(LINKED_ISSUES_QUERY, /closingIssuesReferences/);
  assert.match(LINKED_ISSUES_QUERY, /nodes \{ number issueType \{ name \} \}/);
});
