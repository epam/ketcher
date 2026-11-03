# Import, Export & Structure Checking

Structures must move in and out of Ketcher in the many chemical file formats used across cheminformatics, and users need to validate a structure and inspect its computed properties before saving.

Spec: [openspec/specs/import-export/spec.md](../../openspec/specs/import-export/spec.md)

## Limitations

- Formats differ in expressiveness; e.g. reaction/multi-step/multi-tailed features degrade in non-KET formats (see [reactions](./reactions.md)).
- InChIKey, PNG, and SVG are effectively export-only representations.
- IDT and AxoLabs encode modifications in vendor-specific ways.

## Related

- Formats & services: [serialization](../modules/serialization.md) · Standalone engine: [ketcher-standalone](../modules/ketcher-standalone.md)
- See also: [clipboard](./clipboard.md), [reactions](./reactions.md)
