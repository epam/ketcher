# Clipboard

A user copies, cuts, and pastes structures on the canvas. A paste follows the pointer until a click drops it. Behavior is owned by [openspec/specs/clipboard/spec.md](../../../../openspec/specs/clipboard/spec.md).

## Sub-features

- `clip-copy-paste` copies the selection and pastes an independent duplicate.
- `clip-cut-paste` cuts the selection and pastes it back.
- `clip-paste-undo` removes a whole paste with one undo.
- `clip-paste-button` shows a "use shortcut" message from the Paste button.
- `clip-paste-drag-bond` attaches a paste with a new bond when the user drags from the canvas atom it would merge into.

## How to get to it (user POV)

- Press `Mod+C`, `Mod+X`, and `Mod+V`. After `Mod+V`, click the canvas to drop the structure.
- The top toolbar has `copy-button`, `cut-button`, and `paste-button` (`ketcher-autotests/tests/pages/molecules/MoleculesTopToolbar.ts`). In Chromium the Paste button only opens an info message.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Copy and paste.** Run `node $D load --text CCO`, `node $D canvas-click --dx 300 --dy 200`, `node $D press --key ControlOrMeta+a`, `node $D press --key ControlOrMeta+c`, `node $D press --key ControlOrMeta+v`, `node $D canvas-click --dx 250 --dy 0`. Export `smiles`: `CCO.CCO`.
- **Undo the paste.** Run `node $D click --testid undo`. Export: `CCO`.
- **Cut and paste.** Run `node $D press --key ControlOrMeta+a`, `node $D press --key ControlOrMeta+x`. Export: empty. Run `node $D press --key ControlOrMeta+v`, `node $D canvas-click`. Export: `CCO`.
- **Drag a paste from an atom.** Run `node $D load --text c1ccccc1`, `node $D canvas-click --dx 300 --dy 200`, `node $D press --key ControlOrMeta+a`, `node $D press --key ControlOrMeta+c`, `node $D press --key ControlOrMeta+v`, `node $D drag --from-dx 0 --from-dy -80 --to-dx 0 --to-dy -200 --settle-ms 300`. The preview's bottom atom sits on the ring's top atom at `--dy -40`. Export `smiles`: `c1(-c2ccccc2)ccccc1`. Without the bond it is `c1ccccc1.c1ccccc1`.
- **Paste button.** Run `node $D click --testid paste-button`. `node $D state --testid info-modal-window` shows the text "Your browser doesn't allow pasting clipboard content via button". Close with `node $D click --testid info-modal-close`.

## Gotchas

- Copy clears the selection. Press `Mod+A` again before a cut.
- Drop a paste away from the original (`--dx 250`). The preview starts at the canvas centre, on top of a centred structure, and a drop there can merge atoms.
- The paste preview finds its merge atoms 50 ms after the pointer stops. Pass `--settle-ms 300` to `drag` so the press lands after that, as a user's would.
- Copy and paste rely on the clipboard permissions that `drive.mjs` grants; see [SKILL.md](../SKILL.md#drive).
