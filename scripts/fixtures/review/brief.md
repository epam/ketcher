<!-- claude-review:v1 {"round":2,"head":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","posted":["0123456789abcdef"]} -->

## Claude review: round 2 of 3

**Linked issue:** #123: the diff fixes it in part. Undo is not fixed.
**PR type:** Bug fix.
**Reviewed:** the commits after `bbbbbbb`.
**Panel:** correctness, reuse.
**Models:** claude-sonnet-5-5.
**Findings:** 1 blocker, 1 major, 1 nit.
**Not reviewed:** 2 generated, lock or autotest files.

### Over the comment cap

- `src/Editor.ts:3` · **nit** · R5 · Odd name.

### Outside the diff

- `src/Editor.ts:40` · **major** · R5 · Old code repeats it.

### Passes without a result

- `performance`

**Feedback:** 👎 a finding that is wrong. Better still, reply to it with `Dismissed: <why>` — one sentence. A reaction can only be counted, a reason can change a rule or add an accepted pattern. 👍 marks a good catch.