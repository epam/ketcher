## Context

The dropdown labels come from the S-group schema in `struct-schema.ts`, whose titles are locale keys. Option test ids are built from the visible label (`Select.tsx`). Bracket labels are drawn in `resgroup.ts` as the bracket's lower index text: Multiple group draws its repeat count and SRU polymer its polymer label (`n` by default); Copolymer drew the raw subtype, or nothing.

The Copolymer subtype is stored as `ran`, `blo`, `alt`. `BLO` is the value in files: Ketcher's molfile writer and Indigo both read and write `M  SST … BLO`. Ketcher writes the KET subtype upper case but read it back unchanged, while the connectivity beside it is lower-cased on read.

## Goals / Non-Goals

**Goals:**

- Show the standard labels in the dropdowns and at the Copolymer bracket.
- Keep the stored and saved values as they are.

**Non-Goals:**

- PNG/SVG export labels, which Indigo renders (epam/Indigo#3845).
- New S-group types (#10459, #10665, #10666).

## Decisions

### Decision 1: Labels in the locale strings

The abbreviations are appended to the existing locale strings in every language, since they are standard symbols. No new rendering path for the dropdown.

### Decision 2: `blk` is display-only

A label map turns the stored subtype into its abbreviation (`blo` → `blk`); a blank subtype gives `co`. Changing the stored value to `blk` would break molfile and Indigo round-trips, where the value is `BLO`.

### Decision 3: Lower-case the subtype when reading KET

Done where the data is produced, like the connectivity on the line above, so the label and the dialog see the stored form. Saving still upper-cases it.

## Risks / Trade-offs

- The option test ids change with the labels, so the E2E constants and the screenshots showing these labels or Copolymer brackets are updated.
