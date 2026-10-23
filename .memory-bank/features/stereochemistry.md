# Stereochemistry

## Problem

Many molecules are chiral, and their biological and chemical behavior depends on 3D configuration. Ketcher must let users express stereochemistry in 2D (stereo bonds), compute standard descriptors, and group stereocenters with enhanced-stereochemistry relationships.

## User interaction

- **Stereo bonds** — draw wedge/hash bonds via the _Bond tool_ (single up, single down, single up/down, cis/trans) to encode tetrahedral and double-bond geometry (see [bond-editing](./bond-editing.md)).
- **Calculate CIP** — the _Calculate CIP_ button (`Mod+p`) assigns CIP stereo-labels (S/R, s/r, E/Z) to stereocenters on the canvas.
- **Enhanced Stereochemistry** — the _Stereochemistry_ button (`Alt+e`) opens a dialog to assign enhanced stereo marks (Absolute / AND / OR) to correctly-drawn tetrahedral centers.
- **Settings** — the _Stereochemistry_ settings tab controls display of stereo flags, flag text, label style/colors, color display mode, and the _Ignore the chiral flag_ option.

## Expected behavior

Stereo descriptors are derived from the drawn structure and stay consistent with the enhanced-stereochemistry grouping and display settings.

#### Scenario: Assigning CIP labels

- **WHEN** the user clicks _Calculate CIP_ with stereocenters present
- **THEN** each recognized stereocenter is annotated with its S/R, s/r, or E/Z label

#### Scenario: Assigning enhanced stereo marks

- **WHEN** the user selects tetrahedral stereocenters and assigns Absolute / AND / OR in the _Enhanced Stereochemistry_ dialog
- **THEN** the selected centers are grouped accordingly and displayed with the corresponding flags

#### Scenario: Ignore chiral flag on import

- **WHEN** _Ignore the chiral flag_ is enabled and an MDL V2000/V3000 file is opened
- **THEN** stereo flags are not displayed and stereocenter labels appear only for non-absolute groups

## Guarantees

- CIP assignment follows the CIP priority rules as implemented by the underlying engine (Indigo).
- Enhanced-stereochemistry grouping (Absolute/AND/OR) is preserved in formats that support it.

## Limitations

- CIP labels are recomputed on demand (via the button); they are not continuously live as the structure changes.
- The _Ignore the chiral flag_ setting only affects MDL V2000/V3000 import and label/flag display.
- This is a **molecules-mode** feature.

## Related

- Formats & compute: [serialization](../modules/serialization.md) (Indigo) · Model: [domain.md](../domain.md)
- See also: [bond-editing](./bond-editing.md), [import-export](./import-export.md)
