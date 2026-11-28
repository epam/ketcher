## 1. Labels

- [x] 1.1 Append the standard labels to the Multiple group, SRU polymer and Copolymer type names, and to the Random, Block and Alternating subtypes, in the `en`, `es` and `zh-CN` locales
- [x] 1.2 Draw the Copolymer bracket label from the subtype: blank → `co`, `ran` → `ran`, `blo` → `blk`, `alt` → `alt`
- [x] 1.3 Lower-case the Copolymer subtype when reading KET

## 2. Tests

- [x] 2.1 Unit tests for the Copolymer label and for reading the KET subtype
- [x] 2.2 Update the S-group dialog unit tests and the E2E option test ids for the new labels
- [x] 2.3 Regenerate the E2E screenshots that show these labels or Copolymer brackets

## 3. Verification

- [x] 3.1 Verify in the app: dropdown labels, bracket labels for each Copolymer subtype, Multiple group and SRU unchanged, KET and molfile round-trips keep `RAN`/`BLO`/`ALT`
