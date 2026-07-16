# Monomer Library

> The catalog of polymer building blocks (peptides, RNA/DNA, CHEM) used by the macromolecules editor.

Deep-dive complementing the entities in [../domain.md](../domain.md) and the UI in [ketcher-macromolecules](./ketcher-macromolecules.md).

## Responsibility

Load, cache, validate, merge, and serve monomer templates and RNA presets so users can browse and place polymer building blocks on the macro canvas.

## Loading, caching & merging

- **Bundled default data:** A large KET-format JSON ships with the core package and contains all default monomer templates, ambiguous templates, and RNA preset (monomer-group) templates. It is loaded when the macromolecules editor is instantiated.
- **Parse pipeline:** The raw KET library is parsed by the KET serializer, which iterates the template list and converts each entry into its runtime form — plain monomer templates become monomer items, and ambiguous templates become ambiguous monomer definitions.
- **Persistent cache (survives editor re-instantiation):** The parsed library and its source JSON are cached at module scope so the (large) default library is parsed only once per page rather than once per editor instance. When the cache is present it is reused directly ("load once" behavior); otherwise the library is parsed, any stored user updates are replayed on top, and the cache is populated.
- **Custom libraries:**
  - **Merge/upsert path** — validates disallowed modification types and HELM/BILN/IDT alias rules, detects alias collisions, then upserts (matching monomers are replaced in place preserving their id, new ones are appended) and merges RNA preset group templates. An update event is dispatched, and an error is raised if any items had to be skipped.
  - **Initialize from Ketcher** — an optional `replace` mode clears the existing library first, then converts the incoming data to KET and merges it.
  - Updates can be persisted to localStorage (replayed on next load) when the corresponding setting is enabled.
- **Into the UI:** On startup the UI is seeded with the current library and default presets, and it subscribes to library-update events to stay in sync.

## Data model

- **Monomer item** — the template form of a monomer: a label, a `Struct`, optional attachment points, and a props bag (monomer name, monomer class, natural-analogue code, HELM/BILN/IDT aliases, modification types, and flags such as `isMicromoleculeFragment` and `hidden`).
- **Ambiguous monomer** — an id plus a set of member monomers, a subtype, options, and an `isAmbiguous` flag.
- **Attachment points** — named `R1`–`R8`. Each name maps to either a polymer bond, a monomer-to-atom bond, or nothing.

**Monomer entity classes:** An abstract base monomer holds the monomer item, the attachment-point-to-bond map, and hydrogen bonds. Concrete subclasses exist for peptide, sugar, phosphate, RNA base, and CHEM. The ambiguous monomer resolves its class from its components (falling back to CHEM when mixed) and derives its attachment points from the intersection of its components. A factory maps a monomer to its entity class, renderer class, and monomer class.

## RNA builder & presets

A preset bundles a **Sugar + Base + Phosphate** with a phosphate position ('left'/'right') and the connections between them.

- **Default presets** are monomer-group templates of class RNA from monomer library, exposed by the editor and resolved into preset objects by the macromolecules helpers.
- **Placement:** The drawing-entities manager positions the three monomers, determines the 5′/3′ phosphate from attachment points, and creates the monomer-add operations plus inter-monomer bonds. A dedicated preset tool drives placement on the canvas, while sequence mode has its own path for inserting a preset from the library.
- **State:** The RNA-builder store slice tracks the active preset, default and custom presets, group validations, and a phosphate filter (5′/3′/no-phosphate, persisted). Custom presets are cached in localStorage, and a hook seeds default + custom presets on mount.

## Library UI panel

The panel lives in the macromolecules package and is composed of:

- A search input, a hide toggle, and a set of tabs.
- **Four tabs:** Favorites, Peptides, RNA (which hosts the RNA builder), and CHEM. RNA is the default tab.
- A monomer list that renders a group per natural-analogue code, ambiguous groups, and preset favorites.
- The RNA builder: a preset editor (collapsed/expanded), element views (tabs/accordion), and a phosphate-filter popup.

**State:** A library store slice holds the monomers, default RNA presets, favorites, the search filter, and the selected tab. The filtering logic matches on name, full name, IDT/HELM/BILN/AxoLabs aliases, modification types, and 3-letter amino-acid codes; it excludes `hidden` monomers (preset components). Favorites are keyed by a unique monomer key and persisted to localStorage.

## Assumptions & constraints

- The persistent cache means the (large) default library is parsed once per page, not per editor instance.
- Custom-library upserts have **no rollback**: valid items commit even if others are skipped.
- Preset components created in monomer creation wizard are marked `hidden` so they don't appear as standalone monomers in search.
