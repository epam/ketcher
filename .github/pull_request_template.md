<!--
Fill in every section. Replace the guidance text under each heading with your content.
One "Closes" line per issue this PR fixes; with no issue, delete the line.
-->

## Summary

Start with 1-2 sentences: what this PR changes and why. If you can, add a visual that helps a reviewer understand the PR faster: a diagram, a diff sketch, or a file tree. Use real names from the diff (modules, components, calls).

<what changes and why>

<diagram, diff-sketch, or tree>

## Evidence

Proof that the change works, as before and after. A screenshot is best for a visible change. Next best: a test that failed and now passes, or console output.

- **Before:** <screenshot/output/failing test run>
  **After:** <screenshot/output/passing test run>

For a change you can see in the editor, add a `### Verified in the app` subheading: the feature, the mode, the result. With nothing visible, write `Verified in the app: n/a` and the reason.

## Merge Danger

One-way door: hard to undo (changed KET or MOL output, a removed or renamed public API of `ketcher-core` or `ketcher-react`, settings saved in users' local storage). Two-way door: cheap to roll back.

**Door:** <one-way or two-way>

<optional: description>

What the change can break. Check both editor modes (molecules and macromolecules), file format round trips, `ketcher-standalone` and remote mode, API consumers.

**Blast Radius:** <one-word description>

<optional: potential ramifications of merge>

---

Closes #<issue>

Memory bank: <the file this PR updated, or "not needed">
