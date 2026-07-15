# Import, Export & Structure Checking

## Problem

Structures must move in and out of Ketcher in the many chemical file formats used across cheminformatics, and users need to validate a structure and inspect its computed properties before saving.

## User interaction

- **Open** (`Mod+o`) — _Paste From Clipboard_ (with explicit format choice in macromolecules mode), _Open from File_ (with an editable preview), _Open as New (Project)_ (clears the canvas), or _Add to Canvas_.
- **Save As** (`Mod+s`) — choose file name and format, preview contents, and copy to clipboard. In molecules mode a _Warnings_ tab may list structure inaccuracies.
- **Check Structure** (`Alt+s`) — run selected validation checks; results appear immediately and chosen settings apply to saving.
- **Calculated Values** (`Alt+c`) — display computed molecular properties.
- **Aromatize** (`Alt+a`) / **Dearomatize** (`Ctrl+Alt+a`), **Layout** (`Mod+l`), and **Clean Up** (`Mod+Shift+l`) prepare a structure for viewing/export.

## Expected behavior

Import parses recognized formats into an editable structure; export serializes the canvas to the selected format, warning about anything the format cannot represent.

#### Scenario: Opening a file

- **WHEN** the user opens a file in a supported format
- **THEN** its editable contents are previewed and, on confirmation, the parsed structure is placed on the canvas

#### Scenario: Format auto-recognition in molecules mode

- **WHEN** the user pastes structure text in molecules mode
- **THEN** the format is recognized automatically without the user selecting it

#### Scenario: Explicit format selection in macromolecules mode

- **WHEN** the user pastes content in macromolecules mode
- **THEN** the user must specify the source format before it is parsed

#### Scenario: Save warnings

- **WHEN** the user saves a structure with features a format cannot fully represent
- **THEN** a _Warnings_ tab lists the inaccuracies before saving

#### Scenario: Checking a structure

- **WHEN** the user runs _Check Structure_ with selected checks
- **THEN** results are shown immediately and the chosen check settings are applied to subsequent saving

## Guarantees

- **Molecules mode** supports: KET, MDL Molfile V2000/V3000, SDF V2000/V3000, RDF V2000/V3000, Daylight SMILES, Extended SMILES, CML, InChI / InChI AuxInfo / InChIKey, SVG, PNG, CDXML, Base64 CDX, and CDX.
- **Macromolecules mode** supports: KET, MDL Molfile V3000, Sequence (1- and 3-letter), FASTA, IDT, AxoLabs, SVG, HELM, and BILN.
- Round-trip fidelity is preserved to the extent the target format allows; lossy conversions are surfaced as warnings.

## Limitations

- Formats differ in expressiveness; e.g. reaction/multi-step/multi-tailed features degrade in non-KET formats (see [reactions](./reactions.md)).
- InChIKey, PNG, and SVG are effectively export-only representations.
- IDT and AxoLabs encode modifications in vendor-specific ways.

## Related

- Formats & services: [serialization](../modules/serialization.md) · Standalone engine: [ketcher-standalone](../modules/ketcher-standalone.md)
- See also: [clipboard](./clipboard.md), [reactions](./reactions.md)
