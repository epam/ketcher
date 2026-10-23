# RTL Directional Icon Inventory

Design artifact for Section 8 of the `ketcher-react-i18n-foundation` change. This is a
documentation-only deliverable — no CSS/mirroring logic is implemented here. It exists so a
future RTL-locale change can decide, icon by icon, what needs `transform: scaleX(-1)` (or an
equivalent mirrored asset) once a right-to-left locale is actually added.

## Method

All icons are registered in one place, `packages/ketcher-react/src/components/Icon/utils/iconNameToIcon.ts`,
which maps an icon key to an SVG file under `packages/ketcher-react/src/assets/icons/files/<file>.svg`.
That registry (~210 entries) is the source for this inventory. Each icon was classified into one
of three buckets:

- **Mirror: Yes** — the icon's meaning is tied to reading/UI-navigation direction (e.g. "back"
  vs. "forward"). It should flip horizontally under RTL.
- **Mirror: No — canvas/chemistry-tied** — the icon depicts chemical notation, a bond/reaction/
  monomer symbol, or a tool that acts on the molecule canvas. Per `design.md` Decision 4 the
  canvas subtree is permanently `dir="ltr"` regardless of active locale, and scientific notation
  (a reaction arrow, a 5′/3′ phosphate position, a bond wedge) has a fixed meaning independent of
  UI text direction — mirroring these would change what they *mean*, not just how they read.
- **Mirror: No — direction-neutral** — generic UI pictograms (gear, trash can, checkmark,
  magnifying glass, pencil, etc.) with no inherent left/right bias.

## Group A — Direction-sensitive (recommend mirroring under RTL)

| Icon key | File | Used in | Why it should mirror |
| --- | --- | --- | --- |
| `undo` | `undo.svg` | `UndoRedo` toolbar (Section 2) | Curved "back" arrow — conventionally mirrored in RTL products so it still reads as "undo the last step" |
| `redo` | `redo.svg` | `UndoRedo` toolbar (Section 2) | Curved "forward" arrow — mirror of `undo`; same convention |

No other icon in the registry encodes a "previous/next," "back/forward," or pagination affordance
— there is no dedicated back/forward/pagination icon elsewhere in the app.

**Also flag (not an SVG icon, so outside this inventory's registry-based method, but the same
concern applies):** `ArrowScroll` (`script/ui/views/toolbars/ArrowScroll/`) draws its scroll
buttons as CSS border-triangles, not SVG icons, using the `isLeftRight` prop to pick a horizontal
pair. When RTL is implemented, the scroll-forward/scroll-back triangle pair needs to swap sides
along with the flipped toolbar, the same way `undo`/`redo` do.

## Group B — Canvas/chemistry-tied (must NOT mirror)

These all depict fixed scientific/structural notation or act on the molecule canvas, which stays
`dir="ltr"` per Decision 4. Mirroring any of these would change their chemical meaning.

**Bond & reaction notation:** `bond-any`, `bond-aromatic`, `bond-crossed`, `bond-hydrogen`,
`bond-dative`, `bond-double`, `bond-doublearomatic`, `bond-down`, `bond-single`,
`bond-singlearomatic`, `bond-singledouble`, `bond-triple`, `bond-up`, `bond-updown`, `bonds`
(reused as `bond-single`), all `reaction-arrow-*` variants (open-angle, filled-triangle,
filled-bow, dashed-open-angle, failed, retrosynthetic, both-ends-filled-triangle,
equilibrium-\*, unbalanced-equilibrium-\*, multitail), `reaction-automap`, `reaction-map` /
`reaction-mapping-tools`, `reaction-plus`, `reaction-unmap`, `arom`, `dearom`, `chiral-flag`,
`cip`, `charge-minus`, `charge-plus`, `any-atom`, `chain`.

**Structure/template previews:** `template-0`…`template-7`, `rgroup-attpoints`,
`rgroup-fragment`, `rgroup-label` / `rgroup`, `sgroup`, `generic-groups`, `shapes` /
`shape-ellipse` / `shape-rectangle` / `shape-polyline` / `shape-line`, `extended-table`,
`period-table` (the periodic-table *content* icon reused inside `PeriodTable`; the dialog-open
button use of the same key is direction-neutral chrome, see Group C note below).

**Canvas-acting tools (tied to the fixed-LTR canvas coordinate system):**
`transform-flip-h`, `transform-flip-v` — these flip the *selected molecule* along the canvas's
own axes; "horizontal" here means the canvas's horizontal, not the UI's reading direction.

**Macromolecule/RNA-builder notation:** `sugar`, `base`, `phosphate`, `preset`,
`preset-left-phosphate`, `preset-right-phosphate` (the 5′-left/3′-right phosphate position
markers from the `RnaPresetTabs` UI — Section 5), `nucleotide`, `peptide`, `chem`,
`leavingGroup`, `connectionPoint`, `antisenseStrand` / `antisenseRnaStrand` /
`antisenseDnaStrand`, `arrange-ring`, `monomer-autochain`, `create-monomer`
(`CREATE_MONOMER_TOOL_NAME`), `no-highlight-cross`, `flex-layout-mode`, `snake-layout-mode`,
`sequence-layout-mode`, `snake-mode`. All of these describe a rendering style or biochemical
convention applied to the molecule/sequence on the canvas, not a UI reading-flow cue.
`rap-left-link`, `rap-middle-link`, `rap-right-link`, `arrows-left`, `arrows-right` are registered
but have no current call site in `ketcher-react`'s own component tree (likely consumed by name
from `ketcher-core`'s canvas rendering, or unused) — included here for completeness since their
names and apparent purpose (composing a fixed-orientation preset-chain diagram) match this group.

**Inserted special-symbol characters (Text tool, Section 4):** `←`, `→`, `←/`, `/→`, `↔`, and the
Greek-letter/math-symbol set (`α`–`ω`, `Å`, `°`, `ħ`, `±`, `‰`, `√`, `∏`, `∑`, `∞`, `∂`, `∆`, `∫`,
`≈`, `=/`, `≤`, `≥`, `℉`, `℃`). These are not icons in the UI-chrome sense — they are literal
characters a user inserts into a text annotation via the special-symbols picker
(`SpecialSymbolsList`). An inserted "→" is scientific-notation content, exactly like inserting it
into a document — it must not flip just because the surrounding UI language does.

## Group C — Direction-neutral UI chrome (safe as-is, no mirroring needed)

Generic pictograms with no inherent left/right bias: `about`, `analyse`, `arrow-upward` (vertical,
not RTL-relevant), `check`, `checkmark`, `check-filled`, `chevron` (points down; used for
expand/collapse via rotation, not mirroring), `clean`, `close`, `compressedhand`, `hand`, `copy`,
`copy-image`, `copy-mol`, `copy-ket`, `copyMenu`, `cut`, `delete`, `deleteMenu`, `dropdown`,
`dropdown-indicator` (also a down-pointing chevron), `edit`, `edit-filled`, `editMenu`,
`elements-group`, `erase`, `expand`, `minimize-expansion`, `fullscreen-enter`, `fullscreen-exit`
(diagonal corner-arrow pairs, symmetric), `file-thumbnail`, `filter`, `general`,
`general-white`, `help`, `history`, `image-frame`, `layout`, `logo`, `miew`,
`macromolecules-mode`, `molecules-mode`, `clear`, `not-found`, `open`, `open-1`, `paste`,
`pasteNavBar`, `questionMark`, `recognize`, `reset`, `save`, `save-1`, `search`, `settings`,
`stereo`, `stereo-white`, `atoms`, `atoms-white`, `bond-common`, `bonds-white` (Settings-tab icons
— pictogram reuse, not the bond-notation icons themselves), `server`, `server-white`,
`3dviewer`, `3dviewer-white`, `debugging`, `debugging-white`, `template-lib`, `template-dialog`
(buttons that *open* the template library/dialog — the template preview content itself is Group
B), `text`, `text-bold`, `text-italic`, `text-subscript`, `text-superscript`,
`text-special-symbols`, `vertical-dots`, `warningFilled`, `zoom-in`, `zoom-out`, `zoom-reset`,
`arrowsUpDown` (vertical), `plus`, `add-image` (`IMAGE_KEY`), `select-fragment`, `select-lasso`,
`select-rectangle`, `select-structure` (selection-tool cursor icons — symmetric shapes).

## Summary for the future RTL change

- 2 registered icons (`undo`, `redo`) plus 1 CSS-drawn element (`ArrowScroll`'s scroll triangles)
  need an explicit horizontal mirror when an RTL locale ships.
- The large majority of the icon set (chemistry/bond/reaction/template/monomer notation, and the
  Text tool's special-symbol characters) must be explicitly *excluded* from any blanket
  "mirror everything in RTL" CSS rule, since it is scientific content tied to the always-LTR
  canvas, not UI chrome.
- Everything else is a generic, direction-neutral pictogram and needs no special handling.
