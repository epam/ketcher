# Formats

Full reference specifications for chemical/data file formats native to Ketcher, transcribed from their source documents. Complements the format overview in [../domain.md](../domain.md#supported-chemical-formats) and the implementation deep-dive in [../modules/serialization.md](../modules/serialization.md).

## Documents

- [ket-1.0-specification.md](./ket-1.0-specification.md) — KET format v1.0: full JSON schema (molecules, atoms, bonds, sgroups, r-groups, simple objects, monomer templates/instances, connections, monomer groups, coordinate system), transcribed from the "KET 1.0 specification" source PDF.
- [ket-2.0-specification.md](./ket-2.0-specification.md) — KET format v2.0: same schema plus the v2 changes (`ket_version` field at the top level, extended text object), transcribed from the "KET 2.0 specification" source PDF. Supported starting Indigo 1.28.0.

## Which version to use

**KET 2.0 is current.** It is what Ketcher reads and writes going forward, and is the one to consult when refactoring existing (de)serialization code or implementing new KET-related features.

**KET 1.0 is kept for backwards compatibility and transparency**, not as an active target:

- Legacy documents / integrations may still emit KET 1.0 (no `ket_version` field, no extended text object). Ketcher's KET deserializer must keep reading it, so import-side code paths and version-detection logic still need to account for v1.0 shapes.
- It's the reference for understanding *why* a field is versioned or defaulted a certain way on read (e.g. the plain "text" object predates the v2 extended text object with font/paragraph blocks) — useful when debugging older files or writing migration/upgrade logic.
- It documents the pre-`ket_version` baseline, so diffing it against v2.0 is the fastest way to see exactly what changed between the two (see the "Change list" section at the top of the v2.0 doc).

New serialization code, new fields, and new KET-emitting features should target v2.0 only; treat v1.0 support as read-path/compat concern, not something to extend.

## Usage

KET is Ketcher's native JSON interchange format and the universal intermediate format between the internal model and Indigo (see [serialization.md](../modules/serialization.md)). When implementing or debugging KET (de)serialization — micro or macro — consult these documents for the authoritative field names, types, required/optional status, enum values, and JSON examples, rather than relying on inference from code alone.
