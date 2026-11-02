## Context

The monomer creation wizard can edit RNA presets composed of base, sugar, and phosphate components. Attachment point names alone do not communicate their biological direction, and the preset save flow needs to identify atypical terminal leaving groups without preventing users from choosing them.

## Goals / Non-Goals

**Goals:**

- Identify the sugar R1 and phosphate R2 attachment points as 5' and 3' in RNA preset mode.
- Warn before saving when either expected leaving group differs, while allowing confirmation to preserve the user's choices.

**Non-Goals:**

- Changing attachment-point behavior for individual monomers or non-RNA presets.
- Restricting which leaving groups users may save.
- Changing how presets are serialized.

## Decisions

### Use the RNA preset component owning each attachment atom

Tooltip text is based on whether the attachment atom belongs to the sugar or phosphate component, in addition to the attachment-point name. This avoids assigning a misleading direction to identically named attachment points on other preset components.

### Keep leaving-group validation advisory

The normal preset validation runs first. When it succeeds, the sugar R1 and phosphate R2 leaving groups are compared with their expected values. A mismatch presents a localized confirmation; confirming re-runs submission while skipping only that warning, so the existing validation remains in force.

## Risks / Trade-offs

- A component may be absent or have no corresponding attachment point. In that case, it contributes neither tooltip nor warning.
- The confirmation intentionally permits non-typical attachment points to support customized presets.

## Migration Plan

No migration is required. Existing presets and serialized data remain unchanged.
