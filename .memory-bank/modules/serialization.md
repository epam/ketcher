# Serialization & Formats

> Reading and writing chemical structures in ~25 text formats.

Cross-cutting deep-dive. Complements the format table in [../domain.md](../domain.md#supported-chemical-formats). For the authoritative KET JSON schema (field-by-field), see [../formats/](../formats/README.md) — **v2.0 is current and is what to target for new work; v1.0 is kept for backwards-compatible reads and historical context only.**

## Responsibility

Convert between the internal model (`Struct` / drawing-entities manager) and external text formats. Three layers:

1. **Serializers** — pure in-browser conversion for KET, MOL, and SDF. No server.
2. **Formatters** — a strategy layer that picks local serialization or routes through Indigo per format.
3. **StructService** — the Indigo backend abstraction (remote HTTP or standalone WASM), with a thin convenience wrapper on top.

**End-to-end flow:** raw text → format identification → formatter selection → a local formatter (KET / MOL V2000) **or** the server formatter → Indigo convert/layout returning KET → KET deserialization → `Struct` / drawing-entities manager. Serialization is the reverse. KET is the universal interchange format.

## 1. Serializers

All serializers share a common interface: a `deserialize(content)` that returns the model and a `serialize(model)` that returns text.

### KET

The **central** serializer — the only one that handles **both** micro `Struct` and macro monomers (the drawing-entities manager) in one document. See [../formats/ket-1.0-specification.md](../formats/ket-1.0-specification.md) / [../formats/ket-2.0-specification.md](../formats/ket-2.0-specification.md) for the full field-level schema.

- **Micro:** deserialization parses the JSON, validates it against a schema, and dispatches each node to the matching "from KET" converter; serialization prepares the structure and emits each node via its "to KET" converter, tagging the document with a KET version.
- **Macro:** parse-and-validate, then deserialize macromolecules entities converting into drawing entities (there is also a path to deserialize straight into a `Struct`); serialization emits nodes, connections, and templates.

### MOL

A mol serializer on ketcher side handles **only V2000**. **V3000** is handled by Indigo.

### SDF

Splits records on the record separator, parses each MOL block via the MOL serializer, and parses the property blocks into associated structure data. `FormatterFactory` never selects this serializer, though — it's used only to load Ketcher's bundled static template libraries (functional groups, salts/solvents, RNA presets) at startup. See [invariants.md#a7](../invariants.md).

## 2. Formatters

A formatter exposes async methods to get a string from a structure and a structure from a string. A factory chooses the implementation per format:

- **KET** → local KET formatter.
- **MOL V2000** → local formatter — unless query properties are used, in which case it falls back to the server formatter.
- **Everything else** (V3000, SMILES/SMARTS variants, RXN, InChI, CML, CDX/CDXML, SDF, FASTA, sequence, IDT, HELM, BILN, AxoLabs, …) → the server formatter (Indigo).

So only **KET and plain MOL V2000** are local; all other formats require Indigo.

The server formatter serializes to KET, calls Indigo convert or layout (chosen by whether the format carries coordinates).It also deserializes the KET result returned by Indigo. A format-identification step sniffs raw input (JSON → KET, reaction marker → RXN, version markers → MOL, InChI prefix → InChI, etc.). A format-properties table maps each supported format to its MIME type, extensions, and Indigo options.

## 3. StructService

The service interface covers the full Indigo surface: convert, layout, clean, aromatize/dearomatize, CIP calculation, automap, check, calculate, recognize, InChI key, image generation, explicit-hydrogen toggling, macromolecule property calculation, and info. A MIME-type enum maps formats to MIME strings.

A provider abstraction exposes a mode (`standalone` or `remote`) and a factory that creates a service:

- **Remote** — HTTP requests to Indigo endpoints. A shared helper supplies the standard Indigo option set (also used by standalone).
- **Standalone** — runs Indigo WASM in a worker and satisfies the same interface. See [ketcher-standalone](./ketcher-standalone.md).

**Wiring:** the Ketcher builder asks the provider to create a service, constructs the top-level Ketcher instance with that service and a formatter factory, and records which mode is active.

## Assumptions & constraints

- KET is the interchange format between the model and Indigo for all non-KET/non-MOL-V2000 formats.
- Coordinate systems differ between browser and chemistry conventions; the KET serializer flips the Y-axis.
- **`FormatterFactory` routes only KET and plain MOL V2000 to a local formatter** ([invariants.md#a7](../invariants.md)); every other format case — SDF, RXN, SMILES/SMARTS, InChI, CML, CDX/CDXML, FASTA, HELM, IDT, BILN, AxoLabs, MOL V3000 — resolves to the server formatter (Indigo). The local `SdfSerializer` is never selected by `FormatterFactory`; it exists only for internal template-library loading. A user-facing import bug in a non-local format belongs in Indigo or in how Ketcher consumes Indigo's KET/error result — not in a new client-side parser, and not in `SdfSerializer`.
