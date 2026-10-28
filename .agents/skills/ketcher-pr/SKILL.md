---
name: ketcher-pr
description: 'Write the title and body of a Ketcher pull request from the repo PR template: a Summary visual, before/after Evidence, and Merge danger. Use when opening a PR or rewriting its description.'
metadata:
  credits:
    skill: show-me
    author: Dex Horthy
    organisation: Humanlayer
    url: 'https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md'
---

# Ketcher PR body

The body is `.github/pull_request_template.md`, filled in. Copy its headings in order: `gh pr create --body-file` does not insert the template for you. A large-scale change uses `.github/PULL_REQUEST_TEMPLATE/large-scale-change.md` instead; add the _Merge danger_ section below to it, and its Revert plan answers the door.

Keep prose brief and skip preambles. Name things as [glossary.md](../../../.memory-bank/glossary.md) names them.

## Title

`#<issue> - <issue title>`. With no issue, a short plain title in the form [coding-standards.md](../../../.memory-bank/coding-standards.md#tooling-and-process) gives.

## Summary

One or two sentences on what changed and why, then the smallest visual that makes the key point clear. Pick one; use two only when each answers a different question.

- **Call tree** for runtime control flow:

```text
CoreEditor.onFlipHorizontal()
  drawingEntitiesManager.flipSelectedDrawingEntities('horizontal')
  history.update(command)
  renderersContainer.update(command)
```

- **File tree** for file responsibility or a broad refactor:

```text
packages/ketcher-core/src/domain/serializers/
├── ket/   # KET read and write
├── mol/   # MOL read and write
└── sdf/   # SDF read and write
```

- **Component tree** for UI structure, with the state and package boundaries that matter.
- **Pseudocode** for logic or an algorithm.
- **Mermaid** sequence or flow diagram for interaction between parts.
- **`diff`** of any of the above when the surrounding shape already exists and the point is what changes:

```diff
 CoreEditor.onFlipHorizontal()
   drawingEntitiesManager.flipSelectedDrawingEntities('horizontal')
   history.update(command)
   renderersContainer.update(command)
+  drawingEntitiesManager.rerenderBondsOverlappedByMonomers()
```

- **Whole code block** when most of it is new, or when cut context would hide order or ownership.

Keep only the calls, files, props, and states the reader needs. Use real names from the diff.

## Evidence

A before and after that proves the change works.

- **Visual change:** screenshots are the best evidence. When you ran `verify-ketcher`, put its verdict here under a `### Verified in the app` subheading: the feature, the mode, the result, and what the exported structure showed. With no visual change, write `Verified in the app: n/a` and the reason.
- **Otherwise:** execution evidence. Name the test that failed before and passes now, with the run output, or the console output before and after.

## Merge danger

- **Door:** two-way when a revert of this PR alone undoes it; one-way when it is hard to walk back: a changed KET or MOL output, a removed or renamed public API in `ketcher-core` or `ketcher-react`, settings saved in users' local storage, data migrations.
- **Blast radius:** one word, then the ramifications. Consider both editor modes (molecules and macromolecules), file formats and round trips, `ketcher-standalone` and remote mode, consumers of the public API, layout and theming.

## PR type and Check list

Tick the one PR type row that matches. Tick only the checklist items that are true. After the checklist, add:

- `Closes #<N>` for each issue the PR fixes;
- `Memory bank:` and the file the PR updated, or `not needed`.
