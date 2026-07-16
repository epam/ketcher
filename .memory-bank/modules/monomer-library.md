# Monomer Library

> The catalog of polymer building blocks (peptides, RNA/DNA, CHEM) used by the macromolecules editor.

Deep-dive complementing the entities in [../domain.md](../domain.md) and the UI in [ketcher-macromolecules](./ketcher-macromolecules.md).

## Responsibility

Load, cache, validate, merge, and serve monomer templates and RNA presets so users can browse and place polymer building blocks on the macro canvas.

## Loading, caching & merging

- **Bundled default data:** `packages/ketcher-core/src/application/editor/data/monomers.ket` — a KET-format JSON (~3.55 MB) with all default monomer templates, ambiguous templates, and RNA preset (monomer-group) templates. Imported in `CoreEditor` (`editor/Editor.ts`).
- **Parse pipeline:** `parseMonomersLibrary` (`editor/helpers.ts`) → `new KetSerializer().convertMonomersLibrary(...)` iterates `root.templates`, converting `MONOMER_TEMPLATE` → `MonomerItemType` and `AMBIGUOUS_MONOMER_TEMPLATE` → `AmbiguousMonomerType`.
- **Module-level cache (survives editor re-instantiation):** `persistentMonomersLibrary` and `persistentMonomersLibraryParsedJson` in `editor/Editor.ts`. `setMonomersLibrary()` reuses the cache when present (this is the "load once" behavior noted in [architecture.md](../architecture.md)); otherwise it parses, replays stored updates from `SettingsManager.monomerLibraryUpdates`, and populates the cache.
- **Custom libraries:**
  - `updateMonomersLibrary(data)` — merge/upsert path. Validates disallowed modification types and HELM/BILN/IDT alias rules, detects alias collisions, then upserts (matching monomers replaced in place preserving `id`, new ones appended) and merges RNA preset group templates. Dispatches `events.updateMonomersLibrary`. Throws `MonomerLibraryUpdateError` if items were skipped.
  - `initializeMonomersLibraryFromKetcher(update?, replace?)` — `replace` clears first (`clearMonomersLibrary()`), converts to KET, then updates.
  - Updates are persisted via `SettingsManager.addMonomerLibraryUpdate` (localStorage) when `persistMonomerLibraryUpdates` is true.
- **Into the UI:** `EditorEvents.tsx` dispatches `loadMonomerLibrary(editor.monomersLibrary)` and `loadDefaultPresets(...)`, and subscribes to `editor.events.updateMonomersLibrary`.

## Data model

`domain/types/monomers.ts`:

- `MonomerItemType` — `{ label, struct: Struct, attachmentPoints?, props: { MonomerName, MonomerClass?: KetMonomerClass, MonomerNaturalAnalogCode, aliasHELM?, aliasBILN?, idtAliases?, modificationTypes?, isMicromoleculeFragment?, hidden?, … } }`.
- `AmbiguousMonomerType` — `{ id, monomers: BaseMonomer[], subtype, options, isAmbiguous: true }`.
- `AttachmentPointName` enum — `R1`–`R8` + `HYDROGEN`. `AttachmentPointsToBonds` maps each name → `PolymerBond | MonomerToAtomBond | null`.

`domain/constants/monomers.ts`: `KetMonomerClass` enum (`AminoAcid, Sugar, Phosphate, Base, Terminator, Linker, Unknown, CHEM, RNA, DNA`), natural-analogue tables, ambiguous symbols (`StandardAmbiguousRnaBase`, `StandardAmbiguousPeptide`).

**Monomer entity classes** (`domain/entities/`): `BaseMonomer` (abstract, holds `monomerItem`, `attachmentPointsToBonds`, `hydrogenBonds`), concrete `Peptide`, `Sugar`, `Phosphate`, `RNABase`, `Chem`, and `AmbiguousMonomer` (`getMonomerClass` resolves from components, returns `CHEM` if mixed; `getAttachmentPoints` intersects component attachment points). `monomerFactory(monomer)` returns `[EntityClass, RendererClass, KetMonomerClass]`.

## RNA builder & presets

A preset (`IRnaPreset`, defined in `application/editor/tools/Tool.ts`) bundles a **Sugar + Base + Phosphate** with a `phosphatePosition` ('left'/'right') and connections.

- **Default presets** are `MONOMER_GROUP_TEMPLATE` entries of class RNA, exposed via `CoreEditor.defaultRnaPresetsLibraryItems`. Resolved into `IRnaPreset` objects by `getPresets` (`ketcher-macromolecules/src/helpers/getPreset.ts`).
- **Placement:** `DrawingEntitiesManager.addRnaPreset(...)` positions the three monomers, determines 5′/3′ phosphate via attachment points, and creates `MonomerAddOperation`s + inter-monomer bonds. `RnaPresetTool` (`tools/RnaPreset.ts`, `ToolName.preset`) drives canvas placement; `SequenceMode.insertPresetFromLibrary` handles sequence mode.
- **State:** `rnaBuilderSlice.ts` holds `activePreset`, `presetsDefault`, `presetsCustom`, group validations, and `presetPhosphateFilter` (5′/3′/no-phosphate, persisted). Custom presets are cached in localStorage (`manipulateCachedRnaPresets.ts`); the `useSetRnaPresets` hook seeds default + custom presets on mount.

## Library UI panel

`packages/ketcher-macromolecules/src/components/monomerLibrary/`:

- `MonomerLibrary.tsx` — search input + hide toggle + tabs.
- `tabsContent.tsx` — four tabs: **Favorites**, **Peptides**, **RNA** (→ `RnaBuilder`), **CHEM**. Default tab: RNA.
- `monomerLibraryList/MonomerList.tsx` — renders `MonomerGroup` per natural-analog code, ambiguous groups, and preset favorites.
- `RnaBuilder/` — preset editor (collapsed/expanded), element views (tabs/accordion), phosphate-filter popup.

**State:** `librarySlice.ts` holds `monomers`, `defaultRnaPresets`, `favorites`, `searchFilter`, `selectedTabIndex`. `selectFilteredMonomers` matches name, full name, IDT/HELM/BILN/AxoLabs aliases, modification types, and 3-letter amino-acid codes; it filters out `hidden` monomers (preset components). Favorites are keyed by `getMonomerUniqueKey` and persisted to localStorage.

## Assumptions & constraints

- The persistent cache means the (large) default library is parsed once per page, not per editor instance.
- Custom-library upserts have **no rollback**: valid items commit even if others are skipped.
- Preset components are marked `hidden` so they don't appear as standalone monomers in search.
