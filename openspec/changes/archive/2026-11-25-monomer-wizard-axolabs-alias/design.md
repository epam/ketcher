# Design

## Context

See proposal.md for the motivation and specs/macromolecules/spec.md for the behavior.

- The library format already carries `aliasAxoLabs` as one string on monomer templates and on RNA preset (monomer group) templates. The KET serializer, the library item props, and the monomer preview already handle it.
- AxoLabs import and export run in Indigo. Ketcher sends Indigo the whole parsed monomer library, including monomers the user created, with every convert call. A monomer saved with `aliasAxoLabs` is therefore usable in AxoLabs import and export with no Indigo change.
- The default library holds 35 AxoLabs aliases and no duplicates: 27 on RNA presets (`A`, `dA`, `Am`, `(5Mc)`), 5 on nucleotides (`(invdA)`), 2 on phosphates (`p`, `s`), 1 on a CHEM (`(NHC6)`). Case matters: `a` and `A` are different presets.
- The wizard's BILN alias is the closest existing pattern: a string field in the _Aliases_ accordion, checked on _Submit_, highlighted until the next _Submit_, cleared on type change, kept for hidden fields on save, and dropped when a copy is saved as a new entry.
- The editor's monomer list, which the HELM and BILN uniqueness checks read, holds monomers only. RNA presets live in the parsed library JSON.

## Goals / Non-Goals

**Goals:**

- Follow the BILN alias pattern in every layer, so the AxoLabs alias adds no new mechanism to the wizard.
- Keep the bracket rule in one function, so a product decision to change it touches one place.

**Non-Goals:**

- Position checkboxes (5', internal, 3') and a per-position storage format.
- Validating `aliasAxoLabs` when an external monomer library is loaded. The editor's library-update validation is left as it is.
- AxoLabs aliases in the wizard's RNA preset mode, on the preset or on its components. #8248 lists them as optional, and they are left for a follow-up.
- Searching the library by a new AxoLabs alias. Library search already matches preset AxoLabs aliases and is unchanged.

## Decisions

### One alias value, no position checkboxes

The alias stays a single string that applies to every position.

- **Why:** the library format and Indigo store it that way. Positions need a structured value, an Indigo release, and a migration of the 35 default aliases and of saved user libraries.
- **Evidence:** the attribute section of #7929 and #7863 defines `"aliasAxoLabs": "[String]"`. The AxoLabs format (epam/Indigo#3152, requirement 3) says AxoLabs symbols have no position indicators, and its only position rules are hard-coded for `p` (terminal only) and `s` (internal only). The import tests load `5'-(invdA)(invdA)(invdA)-3'` as the same nucleotide at every position.
- **Alternative:** remember positions in Ketcher only. Rejected because AxoLabs import and export would ignore them, so the user's choice would silently have no effect.

### Plain field in the _Aliases_ section, not a `+ Add AxoLabs alias` button

The field sits next to HELM and BILN. An empty field means no alias, and clearing it removes the alias.

- **Why:** the issue's UX section is "TBD", and the HELM and BILN aliases already use plain fields. A plain field satisfies add, remove, and collapse with no new control.
- **Evidence:** the IDT alias PR #10510 (#7863, whose requirements also ask for an `+ Add` button and a collapsible section) aligned with the design by placing plain IDT fields inside the _Aliases_ section, as its screenshots show. The AxoLabs field goes below the IDT fields.
- **Alternative:** an add button that reveals the field. Kept as a markup-only change if UX asks for it later.

### Field hidden on RNA preset component tabs

The preset tabs render the same fields component as the single-monomer wizard, so the Phosphate tab would show the AxoLabs field. The fields component gets a flag that hides it, following the existing natural analogue flag, and the preset tabs turn it off.

- **Why:** the preset mode skips uniqueness checks because components are saved as hidden monomers, so an alias typed there would be saved unchecked and could collide with `p` or `dA`.

### Validation functions in ketcher-core

Add to the alias utilities, next to the HELM and BILN ones:

- the three message constants and the maximum length of 6;
- a function that returns which format rule an alias breaks, checked in the order characters, bracket placement, length;
- a function that strips one leading `(` and one trailing `)`;
- a function that wraps the stripped value in brackets.

An alias of only brackets, such as `()`, breaks the length rule, because its value without brackets is empty.

- **Why:** the HELM and BILN format rules and messages live there, and a later library-load check can reuse them.

### Uniqueness against monomers and presets, on the stripped value

The wizard collects the stripped AxoLabs aliases of every library monomer except the one being edited, plus every monomer group template in the parsed library JSON. It compares them with the stripped value the user typed, case-sensitively.

- **Why:** most default aliases belong to presets, so a monomer-only check would allow `dA` on a new nucleotide and make AxoLabs parsing ambiguous. Stripping brackets stops `(dA)` from passing next to `dA`.
- **Alternative:** compare the raw strings. Rejected for the ambiguity above.

### Brackets added on save

The wizard passes the bracket-wrapped value to the editor's save call. The field keeps what the user typed until then.

- **Why:** requirement 1.7 of the issue. The bracketed form is always a single AxoLabs token. Indigo parses symbols without brackets only from a fixed list (epam/Indigo#3152, requirement 5) and loads an unknown bracketed symbol as an unresolved monomer, so a custom alias is readable only in brackets. The analysis comment on the issue asks whether to add brackets only when needed. If the product owner chooses that, only the wrapping function changes.

### Copies start without an AxoLabs alias

The initial values for flows that append `_Copy` leave the AxoLabs alias empty. _Edit_ from the library loads it unchanged.

- **Why:** HELM and BILN copies append `_Copy`, but `_` is not an allowed AxoLabs character, `_Copy` pushes most aliases past 6 characters, and the unchanged alias collides with the original. An empty field is the only value that passes every rule. PR #10510 makes the same choice for IDT.

### Save path follows BILN

When the edited library entry is kept (same code and type) and the new type has no AxoLabs field, the original alias is kept. When the save creates a new entry, an alias equal to the original's is dropped.

## Risks / Trade-offs

- [The open IDT alias PR #10510 changes the same wizard files] → Keep the edits next to the BILN code paths so the conflicts are small. Whichever PR merges second rebases.
- [The product owner may still ask for position checkboxes] → The single-value field is a subset of that design. Positions would add controls and a storage change without undoing this work.
- [The product owner may choose brackets only when needed] → One function changes. Existing saved aliases stay valid under either rule.
- [A user library loaded from outside may already hold duplicate or malformed AxoLabs aliases] → The wizard rejects only the alias being saved. Library loading is unchanged.
