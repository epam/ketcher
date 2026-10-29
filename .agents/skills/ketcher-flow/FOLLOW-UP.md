# Follow-up

The **follow-up** kind of [SKILL.md](SKILL.md): open PRs whose reviewers left comments to address. You address each unresolved comment on the PR's own branch, review the fixes, push, and draft a reply per comment. You run it yourself, without subagents, until review.

Take the whole state from the PR: its branch, its threads, its reviews, and its linked issue. The run that opened it plays no part.

## Steps

1. **Take the input.** When the user named PRs, those are the input. Otherwise list the user's open PRs, `gh pr list --author @me --state open --json number,title,headRefName,reviewDecision`, and keep each one that has an unresolved thread or a `CHANGES_REQUESTED` review (the query in step 2). Create the run directory, slug `follow-up-<PR>`, or `follow-up-<YYYY-MM-DD-HHMM>` for several PRs. Done when you hold the list. Run steps 2 to 7 for one PR at a time.

2. **Read the comments** through GraphQL, which shows which threads are resolved:

   ```sh
   gh api graphql -f query='query { repository(owner: "epam", name: "ketcher") { pullRequest(number: <PR>) { reviewThreads(first: 100) { nodes { id isResolved path line comments(first: 20) { nodes { author { login } body } } } } reviews(last: 20) { nodes { state body } } } } }'
   ```

   Read the PR body and its linked issue (`gh pr view <PR>`, `gh issue view <N> --comments`): with the comments, they are the spec. Done when `<run dir>/<PR>/comments.md` lists each unresolved thread (its id, `path:line`, what it asks) and each `CHANGES_REQUESTED` review body.

3. **Worktree.** `git fetch origin`, then `git worktree add <root>/.ketcher-flow/worktrees/pr-<PR> <head branch>`, installed as LOCATIONS.md says. Save the _Checks_ baseline. Done when the worktree is at the PR's head commit and `<run dir>/baseline/` holds every check's output.

4. **Address.** For each comment, one of:
   - **Change**: a new commit, per _Write_ in [QUALITY.md](QUALITY.md), naming what the comment asked.
   - **No change**: the comment is already met, or following it would break the spec. Note one line of reason.
   - **Stop**: the comment asks for a product or design decision that the spec and the ADRs do not make. Show the user the comment and the options, and wait.

   When a commit changes code that reaches the editor, follow [VERIFY.md](VERIFY.md) yourself on the behavior it changes. Done when every comment has a commit or a reason, and the branch passes the checks against the baseline.

5. **Review.** Follow [REVIEW.md](REVIEW.md) with the commit before step 4 as the branch point and `comments.md` with the linked issue as the spec. You do the cleanup and the fixes yourself. Done when the review rounds have stopped.

6. **Push** to the same branch. A change that alters what the canvas draws runs [SNAPSHOTS.md](SNAPSHOTS.md) after the push. Done when the PR's head is your last commit.

7. **Draft the replies.** One per comment, in `<run dir>/<PR>/replies/<thread id>.md` (a review body gets `review-<n>.md`): the commit that addresses it, or the reason nothing changed. Start each with the line from [TRACKER.md](TRACKER.md). Leave threads unresolved for the reviewer to resolve. Done when every entry in `comments.md` has its reply file.

8. **Post.** Show every reply, one line each, and ask once whether to post them. Post what the user approved: a thread reply with

   ```sh
   gh api graphql -f query='mutation($id: ID!, $body: String!) { addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: $id, body: $body}) { comment { url } } }' -f id=<thread id> -F body=@<reply file>
   ```

   and a reply to a review body with `gh pr comment <PR> --body-file <reply file>`. Done when every approved reply is posted.

9. **Report.** Per PR: its link, one line per comment with what changed or why nothing did, the checks, the verify verdict, and the Lessons (_Landing_ in SKILL.md). Then remove the PR's worktree. Done when the report is printed and `git worktree list` no longer shows `pr-<PR>`.
