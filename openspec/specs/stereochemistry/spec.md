# Stereochemistry Specification

## Purpose

Many molecules are chiral, and their biological and chemical behavior depends on 3D configuration. Ketcher must let users express stereochemistry in 2D (stereo bonds), compute standard descriptors, and group stereocenters with enhanced-stereochemistry relationships.

## Requirements

Stereo descriptors are derived from the drawn structure and stay consistent with the enhanced-stereochemistry grouping and display settings.

### Requirement: Assigning CIP labels

The system SHALL ensure that each recognized stereocenter is annotated with its S/R, s/r, or E/Z label.

#### Scenario: Assigning CIP labels

- **WHEN** the user clicks _Calculate CIP_ with stereocenters present
- **THEN** each recognized stereocenter is annotated with its S/R, s/r, or E/Z label

### Requirement: Assigning enhanced stereo marks

The system SHALL ensure that the selected centers are grouped accordingly and displayed with the corresponding flags.

#### Scenario: Assigning enhanced stereo marks

- **WHEN** the user selects tetrahedral stereocenters and assigns Absolute / AND / OR in the _Enhanced Stereochemistry_ dialog
- **THEN** the selected centers are grouped accordingly and displayed with the corresponding flags

### Requirement: Ignore chiral flag on import

The system SHALL ensure that stereo flags are not displayed and stereocenter labels appear only for non-absolute groups.

#### Scenario: Ignore chiral flag on import

- **WHEN** _Ignore the chiral flag_ is enabled and an MDL V2000/V3000 file is opened
- **THEN** stereo flags are not displayed and stereocenter labels appear only for non-absolute groups

## User interaction

- **Stereo bonds** — draw wedge/hash bonds via the _Bond tool_ (single up, single down, single up/down, cis/trans) to encode tetrahedral and double-bond geometry (see [bond-editing](../bond-editing/spec.md)).
- **Calculate CIP** — the _Calculate CIP_ button (`Mod+p`) assigns CIP stereo-labels (S/R, s/r, E/Z) to stereocenters on the canvas.
- **Enhanced Stereochemistry** — the _Stereochemistry_ button (`Alt+e`) opens a dialog to assign enhanced stereo marks (Absolute / AND / OR) to correctly-drawn tetrahedral centers.
- **Settings** — the _Stereochemistry_ settings tab controls display of stereo flags, flag text, label style/colors, color display mode, and the _Ignore the chiral flag_ option.

## Guarantees

- CIP assignment follows the CIP priority rules as implemented by the underlying engine (Indigo).
- Enhanced-stereochemistry grouping (Absolute/AND/OR) is preserved in formats that support it.
