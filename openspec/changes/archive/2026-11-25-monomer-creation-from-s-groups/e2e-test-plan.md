# E2E test plan: monomer creation from S-groups (#7637)

## 1. Feature summary

_Create monomer_ is enabled for selections that contain whole, non-monomer S-groups. The wizard opens only their chemistry, with abbreviations expanded.

| # | Requirement / scenario |
|---|---|
| R1 | A whole data S-group in the selection enables _Create monomer_ |
| R2 | A partly selected S-group keeps it disabled |
| R3 | A contracted abbreviation (`H3C–Tos`) opens expanded in the wizard |
| R4 | Several contracted abbreviations (aspirin with `OAc` and `CO2H`) open expanded in the wizard |

Out of scope: monomers in the selection (unchanged behaviour, covered by existing tests), and saving the monomer (unchanged code path).

## 2. Verified facts

- `monomer-creation.spec.ts` already has data-driven eligibility lists (`eligableMolecules`, `nonEligableMolecules`) using `deselectAtomAndBonds` and `LeftToolbar(page).createMonomerButton`. Cases 17/18 there asserted "S-groups disable the button"; they were identical.
- Abbreviations render with `data-sgroup-name`: `getAbbreviationLocator(page, { name })`. Atoms render with labels: `getAtomLocator(page, { atomLabel })`.
- Opening and closing the wizard: `LeftToolbar(page).createMonomer()` and `CreateMonomerDialog(page).discard()`.
- No existing fixture holds `Tos` or `OAc`/`CO2H` abbreviations.
- On this branch in the app, both examples open expanded in the wizard: 11 and 13 atoms, no S-groups.

## 3. Where the tests live

`tests/specs/Chromium-popup/Monomer-creation/monomer-creation.spec.ts`: the existing suite, with no new spec file.

| Change | Requirements |
|---|---|
| Case 17 in `nonEligableMolecules` becomes "contains part of an S-group" (atoms 0 and 1 deselected) | R2 |
| Case 18 removed from `nonEligableMolecules`; new eligible case 4 "contains a whole data S-group" | R1 |
| 2 new tests after test 4 | R3, R4 |

## 4. Infrastructure

None: existing POMs and helpers only.

## 5. Test cases

Standard comment block (`Test task: https://github.com/epam/ketcher/issues/7637`, Description, Case, Version 3.23). The tests use the suite's shared page.

| Test | Steps | Assert |
|---|---|---|
| 4.1 Contracted abbreviation opens expanded | Open `methyl-tosyl-contracted.ket`, select all, _Create monomer_ | `getAbbreviationLocator({ name: 'Tos' })` count 0; `getAtomLocator({ atomLabel: 'S' })` count 1; then discard |
| 4.2 Several abbreviations open expanded | Open `aspirin-with-abbreviations.ket`, select all, _Create monomer_ | `OAc` and `CO2H` abbreviation counts 0; `getAtomLocator({ atomLabel: 'O' })` count 4; then discard |

## 6. Verification strategy

Structural assertions only (abbreviation and atom counts), so no screenshots and no Docker baselines.

## 7. Test data

`tests/test-data/KET/Chromium-popup/Create-monomer/`:
- `methyl-tosyl-contracted.ket`: CH3 bonded to a contracted `Tos` superatom (the issue's first example).
- `aspirin-with-abbreviations.ket`: benzene with contracted `OAc` and `CO2H` (the second example).

Both are exported from the app as KET.

## 8. Implementation order

1. Fixtures.
2. The case 17/18 changes and the 2 tests.
3. Run the affected tests in Docker (CI environment, `-g` scoped). No snapshot generation: the suite uses no screenshots for these cases.

### Results (2026-11-25)

- Scoped run (`-g "S-group|abbreviation"`, Docker, CI `.env`): 4 passed.
- Whole `Monomer-creation` folder: 525 passed, 43 skipped, 8 flaky (passed on retry), 0 failed.
- Open question in §10 resolved: atom and abbreviation locators see the wizard canvas.

## 9. Rules

- chromium-popup project, imports from `@fixtures`, POMs for both interactions and assertions.
- No `waitForTimeout`, one behaviour per test.

## 10. Open questions / risks

| Question | Mitigation |
|---|---|
| Do atom locators see atoms inside the wizard canvas? | Resolved in the first run: yes |

## 11. Items to fix after manual verification

- none yet
