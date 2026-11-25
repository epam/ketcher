## Context

The wizard's eligibility check rejected any selected atom that belongs to an S-group. Opening the wizard already removed S-groups from its copy of the structure, but only when editing an existing monomer. When a selection includes a contracted abbreviation, it already holds all the hidden atoms, so the full chemistry is available.

## Goals / Non-Goals

**Goals:**

- Accept selections with whole S-groups and load their chemistry expanded.

**Non-Goals:**

- Creating monomers from selections that contain monomers.
- Keeping S-group data (data fields, brackets, abbreviation names) in the new monomer.

## Decisions

- **Whole S-groups only.** Saving a monomer removes every S-group that loses atoms to it, including from atoms left on the canvas. Requiring each S-group to be fully selected means saving never strips a grouping from unselected atoms.
- **One stripping step for both wizard paths.** The wizard copy drops its S-groups and functional groups whether a monomer is being created or edited, reusing the existing edit-path code instead of a second variant.

## Risks / Trade-offs

- Data stored in a data S-group is not carried into the monomer → the requirement asks for the chemical structure only.
