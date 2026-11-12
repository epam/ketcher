# Clipboard

A user copies, cuts, and pastes structures on the canvas. A paste follows the pointer until a click drops it. Behavior is owned by [openspec/specs/clipboard/spec.md](../../../../openspec/specs/clipboard/spec.md).

## Sub-features

- `clip-copy-paste` copies the selection and pastes an independent duplicate.
- `clip-cut-paste` cuts the selection and pastes it back.
- `clip-paste-undo` removes a whole paste with one undo.
- `clip-paste-button` shows a "use shortcut" message from the Paste button.

## How to get to it (user POV)

- Press `Mod+C`, `Mod+X`, and `Mod+V`. After `Mod+V`, click the canvas to drop the structure.
- The top toolbar has `copy-button`, `cut-button`, and `paste-button` (`ketcher-autotests/tests/pages/molecules/MoleculesTopToolbar.ts`). In Chromium the Paste button only opens an info message.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Copy and paste.** Run `node $D load --text CCO`, `node $D canvas-click --dx 300 --dy 200`, `node $D press --key ControlOrMeta+a`, `node $D press --key ControlOrMeta+c`, `node $D press --key ControlOrMeta+v`, `node $D canvas-click --dx 250 --dy 0`. Export `smiles`: `CCO.CCO`.
- **Undo the paste.** Run `node $D click --testid undo`. Export: `CCO`.
- **Cut and paste.** Run `node $D press --key ControlOrMeta+a`, `node $D press --key ControlOrMeta+x`. Export: empty. Run `node $D press --key ControlOrMeta+v`, `node $D canvas-click`. Export: `CCO`.
- **Paste button.** Run `node $D click --testid paste-button`. `node $D state --testid info-modal-window` shows the text "Your browser doesn't allow pasting clipboard content via button". Close with `node $D click --testid info-modal-close`.

## Gotchas

- Copy clears the selection. Press `Mod+A` again before a cut.
- Drop a paste away from the original (`--dx 250`). The preview starts at the canvas centre, on top of a centred structure, and a drop there can merge atoms.
- Copy and paste rely on the clipboard permissions that `drive.mjs` grants; see [SKILL.md](../SKILL.md#drive).
