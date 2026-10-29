---
name: ketcher-pr
description: 'Use when writing the title and body of a Ketcher PR: opening one, or rewriting its description.'
metadata:
  credits:
    skill: pr
    author: Matt Pocock
    url: 'https://github.com/mattpocock/skills/blob/main/skills/engineering/pr/SKILL.md'
    note: "Summary visuals come from Dex Horthy's show-me (HumanLayer), as credited upstream. The Sections text is upstream word for word: edit only the In Ketcher paragraphs."
---

Write the PR body as `.github/pull_request_template.md`, filled in. `gh pr create --body-file` leaves the template out, so copy every heading in order.

A large-scale change uses `.github/PULL_REQUEST_TEMPLATE/large-scale-change.md` instead. There, Evidence of equivalence takes the place of Evidence, and the Revert plan describes the door.

A PR from a batch starts its body with the brief, then a `---` rule, then these sections. _The brief_ in [BATCH.md](../ketcher-flow/BATCH.md) says what it holds.

## Title

`#<issue> - <issue title>`. With no issue, a short plain title.

## Sections

Skip all preambles and keep prose brief. Use the user's domain language from `.memory-bank/glossary.md`.

### Summary

Pick the smallest view that makes the key point clear. [VISUALS.md](VISUALS.md) lists the views, each with an example.

#### Guidance

Place each visual next to the short text it supports. Keep only the calls, files, props, states, and boundaries needed to answer the user's current question or the options to resolve the current discussion point.

You may use one of these, you may use several, it is unlikely you will use all of them. Use your judgement and don't overwhelm the user.

**In Ketcher:** draw from the diff's real names: `CoreEditor` calls, `ketcher-core` and `ketcher-react` modules, React components.

### Evidence

Concrete evidence that the change works. Show a before and after.

Screenshots are S-tier - when the environment is set up for it and the change is visual.

Execution-based evidence is A-tier. Test results, console output. Show the exact test that now fails and passes, using pseudocode.

**In Ketcher:** for a change a user can see in the editor, put the `verify-ketcher` result under a `### Verified in the app` subheading: the feature, the mode, the result, and what the exported structure showed. Upload the screenshots the verification took, and any others that show the change, with `--attach '<file>#<alt text>'` on `gh pr create` or `gh pr edit`, and place each one next to the line it proves with `![<alt text>](<file>)` in the body. With nothing visible, write `Verified in the app: n/a` and the reason.

### Merge Danger

Describe whether it's a one-way or two-way door. You can walk back through two-way doors, but not one-way doors. A PR that is cheap to roll back is lower risk. Changes that involve destructive actions or hard-to-reverse decisions are one-way doors.

The blast radius is the potential impact or scope of the changes introduced by this PR. Consider all possibilities. Examples are layout shift, breakages for consumers, mobile responsiveness, etc.

**In Ketcher:** one-way doors here include a changed KET or MOL output, a removed or renamed public API of `ketcher-core` or `ketcher-react`, and settings saved in users' local storage. For blast radius, check both editor modes (molecules and macromolecules), file format round trips, `ketcher-standalone` and remote mode, and API consumers.

## Closes and Memory bank

One `Closes #<N>` line per issue the PR fixes; with no issue, delete the line. `Memory bank:` names the file the PR updated, or says `not needed`.
