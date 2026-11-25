# Tasks

## 1. AxoLabs alias rules in ketcher-core

- [ ] 1.1 Add the AxoLabs alias message constants, the maximum length of 6, the format-check function (characters, then bracket placement, then length), the bracket-stripping function, and the bracket-wrapping function to the core monomer alias utilities, and export them; verify with unit tests for `p`, `dA`, `ABCDEF`, `(invdA)` (valid), `a b`, `a-b` (characters), `a(b`, `ab)c` (brackets), `ABCDEFG`, `(ABCDEFG)`, `()` (length), and wrapping of `dA` and `(dA)` to `(dA)`
- [ ] 1.2 Add the AxoLabs alias to the wizard's initial-values type in ketcher-core and verify `npm run test:types` in ketcher-core passes

## 2. Wizard field, validation, and save

- [ ] 2.1 Add the AxoLabs alias to the wizard's form field ids, values, initial state, and notification ids, with the four error messages and their `error` types, and the new strings in the `en`, `es`, and `zh-CN` component locales; verify `npm run test:types` in ketcher-react passes
- [ ] 2.2 Add the AxoLabs alias visibility flag for Nucleotide, CHEM, and Phosphate to the wizard's property visibility helper, include it in the _Aliases_ section flag, and add the uniqueness helper that compares stripped, case-sensitive aliases of library monomers (except the edited one) and of RNA preset templates; verify with unit tests for visibility per type, a collision with a monomer (`p`), with a preset (`dA`), between `dA` and `(dA)`, no collision for a different case, and no collision when the edited monomer keeps its alias
- [ ] 2.3 Render the AxoLabs alias field in the _Aliases_ section with the test id `axolabs-alias-input` and the error highlight, following the BILN field, and add a fields-component flag, like the natural analogue one, that the RNA preset tabs use to hide it; verify with component tests that the field shows for Nucleotide, CHEM, and Phosphate only and not on the preset Phosphate tab
- [ ] 2.4 Validate the AxoLabs alias on _Submit_ (format, then uniqueness), keep its errors until the next _Submit_, treat it as optional, and clear it on type change; verify with tests that each of the four errors appears for its input and that a type change clears the value
- [ ] 2.5 Pass the bracket-wrapped AxoLabs alias, or nothing when empty, from both wizard save paths to the editor's save call and into the saved monomer template; verify with a test that saving `Xq` stores `(Xq)` and saving an empty field stores no alias
- [ ] 2.6 Load the stored AxoLabs alias for _Edit_ from the library and leave it empty for every flow that appends `_Copy`; update the existing initial-values tests that assert the alias is not loaded, and verify the new expectations pass
- [ ] 2.7 Keep the original AxoLabs alias on save when the type hides the field, and drop an unchanged alias when the save creates a new library entry, following BILN; verify with library save tests for both cases

## 3. Integration checks

- [ ] 3.1 Run the repository checks (`npm test` at the root and `npx openspec validate --all --strict`) and verify they add no failure the `origin/master` baseline lacks
- [ ] 3.2 Verify in the app with the `verify-ketcher` skill: create a nucleotide with AxoLabs alias `Xq`, see `(Xq)` in its preview, export the canvas to AxoLabs and import it back; record the verdict for the PR

## 4. E2E tests (only if approved at the proposal gate)

- [ ] 4.1 Add the AxoLabs alias input to the Create Monomer dialog page object and Playwright cases to the monomer attributes panel spec for visibility per type, the four errors with the highlight, and saving with brackets; verify the touched specs pass locally

## Workflow follow-up

- Archive the change after review with `openspec archive monomer-wizard-axolabs-alias --skip-specs`, and in the same commit fold its ADDED requirements into `.memory-bank/features/macromolecules.md` by hand.
- Verify the archived result with `npx openspec validate --archived`.
