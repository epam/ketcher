# Stereochemistry

Many molecules are chiral, and their biological and chemical behavior depends on 3D configuration. Ketcher must let users express stereochemistry in 2D (stereo bonds), compute standard descriptors, and group stereocenters with enhanced-stereochemistry relationships.

Spec: [openspec/specs/stereochemistry/spec.md](../../openspec/specs/stereochemistry/spec.md)

## Limitations

- CIP labels are recomputed on demand (via the button); they are not continuously live as the structure changes.
- The _Ignore the chiral flag_ setting only affects MDL V2000/V3000 import and label/flag display.
- This is a **molecules-mode** feature.

## Related

- Formats & compute: [serialization](../modules/serialization.md) (Indigo) · Model: [domain.md](../domain.md)
- See also: [bond-editing](./bond-editing.md), [import-export](./import-export.md)
