## Why

The S-Group Properties dialog lists S-group types by name only, although several of them have standard labels that chemists know them by. On the canvas a Copolymer without a subtype shows no label, and a Block copolymer shows the stored value `blo` instead of the standard abbreviation `blk` (#10457).

## What Changes

- The Type dropdown shows the standard labels: _Multiple group (#)_, _SRU polymer (n)_, _Copolymer (co)_.
- The Copolymer Subtype dropdown shows _Random (ran)_, _Block (blk)_, _Alternating (alt)_; the empty option stays _<Blank>_.
- At the lower-right corner of a Copolymer bracket the canvas shows `co` when there is no subtype, and the subtype abbreviation otherwise (`ran`, `blk`, `alt`). Multiple group (repeat count), SRU polymer (polymer label), Data, Superatom, Query component and Nucleotide component are unchanged.
- A Copolymer subtype read from KET is lower-cased like the other stored values, so it is labelled and matched by the dialog the same way after a round-trip.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `templates-and-groups`: S-group dialog type names and the Copolymer bracket label.

## Impact

- **`ketcher-react`**: the S-group labels in the `en`, `es` and `zh-CN` locale files.
- **`ketcher-core`**: the Copolymer bracket label in the S-group renderer, and the KET reader for the Copolymer subtype.
- **E2E**: the S-group dialog option test ids follow the labels; screenshots showing Copolymer brackets or these dropdown labels change.
- No change to saved files: the subtype is still written as `RAN`, `BLO`, `ALT` in KET and molfiles.
