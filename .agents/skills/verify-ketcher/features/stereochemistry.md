# Stereochemistry

A user opens or draws a structure with stereocenters, labels them with Calculate CIP, and assigns enhanced stereo groups. Behavior is owned by [openspec/specs/stereochemistry/spec.md](../../../../openspec/specs/stereochemistry/spec.md).

## Sub-features

- `stereo-paste` keeps stereo from a chiral SMILES as a wedge or hash bond and as `@`/`@@` on export.
- `stereo-cip` adds R/S labels with Calculate CIP.
- `stereo-enhanced` assigns an AND or OR group in the Enhanced Stereochemistry dialog.
- `stereo-enhanced-disabled` disables the Stereochemistry tool when there are no stereocenters.

## How to get to it (user POV)

- Calculate CIP is in the top toolbar (`Calculate CIP button`, `Mod+P`; `ketcher-autotests/tests/pages/molecules/IndigoFunctionsToolbar.ts`).
- The Stereochemistry tool is in the left toolbar (`enhanced-stereo`, `Alt+E`). It opens `enhancedStereo-dialog` with `abs-radio`, `create-new-and-group-radio`, `create-new-or-group-radio`, and Apply (`OK`). With nothing selected it applies to every stereocenter.

## Driving it with drive.mjs

Preconditions:

- The baseline in [README.md](./README.md). Molecules editor open.

- **Paste.** Run `node $D load --text 'C[C@H](N)O'`. Export `smiles`: one `@` or `@@` on the 4-atom molecule (`C[C@@H](O)N` in the build that mapped this). Export `mol`: counts `4  3`, and one bond line has stereo field `6` or `1`.
- **CIP.** Run `node $D click --testid 'Calculate CIP button'`. Export `ket`: the stereocenter atom has `"cip": "R"`.
- **Enhanced AND group.** Run `node $D click --testid enhanced-stereo`, `node $D click --testid create-new-and-group-radio`, `node $D click --testid OK`. Export `ket`: the stereocenter has `"stereoLabel": "&1"`. Export `extsmiles`: ends with `|&1:1,r|`.
- **Disabled.** Run `node $D open --mode molecules`, `node $D load --text CCO`, `node $D state --testid enhanced-stereo`: `enabled: false`.

## Gotchas

- Atom order changes between input and export. Compare the stereo marker count and the KET `cip` value, not SMILES text.
- CIP labels do not update live. Run Calculate CIP again after every edit.
- Calculate CIP runs in standalone WASM. No Indigo service is needed.
