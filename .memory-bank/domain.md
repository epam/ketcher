# Domain

> What concepts exist in the problem domain?

## Overview

Ketcher operates in two chemical domains simultaneously. The **micromolecules domain** covers small molecules, reactions, and the classical 2D chemistry model. The **macromolecules domain** covers biological polymers — peptides, RNA, DNA, and arbitrary chemical monomers (CHEM) — linked via covalent attachment points and hydrogen bonds.

---

## Molecules

### Atom (micromolecules)

A single atom in a 2D chemical structure. It carries an element symbol, charge, isotope label, and stereo flag. It also knows which S-groups it belongs to, which bonds connect it to neighbors, and whether it is a query atom (element list, exclusion list, or pseudo-atom).

### Bond (micromolecules)

A connection between two atoms. It has a bond type (single, double, triple, aromatic, and others), a stereo direction (up, down, either), and optional query flags.

### Struct

The central data model for the micromolecules domain. It is a graph that holds all atoms, bonds, S-groups, half-bonds, ring loops, reaction arrows and plus signs, fragment groupings, and R-group definitions. It also carries flags for whether the structure is a reaction, is chiral, or contains query features. Deep-copying a struct is the basis of undo/redo and serialization.

### SGroup (S-Group / Superatom / Query Component)

A named group of atoms and bonds with a specific chemical meaning. The supported types are: superatom (an abbreviation or functional-group expansion), multiple group (a repeating fragment), structural repeating unit (a polymer bracket), data S-group (carrying arbitrary key/value data), generic group, and query component. A special subtype — the monomer micromolecule — represents a macromolecule monomer as an S-group inside a struct, serving as the serialization bridge between the two editor domains.

### FunctionalGroup

TBD

### RGroup

A variable attachment point in a structure. An R-group holds one or more fragment alternatives along with occurrence and rest-hydrogen settings, enabling the representation of Markush structures.

### Fragment

A connected component of the molecule graph. Atoms that have no bond path between them belong to different fragments. Fragments are used for layout, clipboard operations, and identifying independent parts of a structure.

### Reaction

A structure in which a reaction flag is set and reaction arrows and plus signs are present. Reactants, agents, and products are identified by the positions of the atoms and fragments relative to the arrows.

---

## Macromolecules

### BaseMonomer

The abstract base for all polymer building blocks on the macromolecules canvas. Every monomer holds a reference to its library template (which carries the symbol, name, class, natural analogue, and aliases), a map of its attachment points to the bonds currently occupying them, a canvas position, and a list of hydrogen bonds it participates in. Concrete kinds are: peptide, sugar, phosphate, RNA base, CHEM, ambiguous monomer, unresolved monomer, and empty monomer.

### PolymerBond

A covalent bond between two monomers, connecting a specific attachment point on each end (for example R2 on one monomer to R1 on the next).

### MonomerToAtomBond

A covalent bond between a monomer and an atom of a small-molecule fragment drawn on the macro canvas. It connects a specific attachment point on the monomer to the atom.

### HydrogenBond

A non-covalent bond between monomers. Used for nucleotide bases to represent base-pairing in double-stranded RNA or DNA in sequence mode. It is visually distinct from a covalent polymer bond and does not occupy attachment points.

### AttachmentPoint

A named connection site on a monomer (R1, R2, R3, and so on) through which it can form a polymer bond. The naming follows the KET format and IUPAC convention.

### DrawingEntity

The abstract base for every item that can exist on the macromolecules canvas. It carries a canvas position, selection state, and a reference to its visual renderer.

### DrawingEntitiesManager

The central data model for the macromolecules canvas. It holds indexed collections of monomers, polymer bonds, hydrogen bonds, monomer-to-atom bonds, and any small-molecule atoms and bonds. It also owns the hidden struct used as a serialization bridge and exposes methods for layout (snake, flex, circular), chain analysis, and antisense-strand computation.

---

### ChainsCollection / Chain / SubChain

A hierarchical grouping of monomers into their polymer chains for the purposes of sequence rendering, layout, and hydrogen-bond computation. A chains collection holds all chains on the canvas. Each chain represents a full polymer backbone. Each chain is further divided into typed sub-chains (peptide, RNA, phosphate, or CHEM). Sub-chains contain the actual sequence nodes (see below).

### SequenceNode types

The individual nodes used when a chain is interpreted as a sequence:

- **Monomer sequence node** — wraps a single monomer for display as one sequence position.
- **Nucleotide** — a fully connected sugar + RNA base + phosphate triplet, displayed as a single letter in sequence mode.
- **Nucleoside** — a sugar + RNA base pair with no phosphate.
- **Unsplit nucleotide** — a nucleotide that has not yet been decomposed into its component monomers.
- **Backbone / linker / empty sequence node** — structural placeholders used to correctly lay out gaps, linkers, and sequence boundaries.
- **Ambiguous monomer sequence node** — wraps an ambiguous monomer (one that can represent any of several alternatives).

---

## Supported Chemical Formats

Via the formatter factory and the Indigo service:

| Format                     | Notes                                            |
| -------------------------- | ------------------------------------------------ |
| KET                        | Native Ketcher JSON format                       |
| Molfile v2000/v3000        | MDL/Symyx Molfile                                |
| RXN                        | Reaction file                                    |
| SMILES                     | Standard SMILES                                  |
| Extended SMILES (CXSmiles) | ChemAxon CX extension                            |
| SMARTS                     | Query SMARTS                                     |
| InChI / InChIKey           | IUPAC InChI                                      |
| CDX / CDXML                | ChemDraw binary/XML                              |
| CML                        | Chemical Markup Language                         |
| SDF / RDF                  | Structure-data file                              |
| FASTA                      | Biopolymer sequences                             |
| HELM                       | Hierarchical Editing Language for Macromolecules |
| BILN                       | Biopolymer notation                              |
| IDT                        | Integrated DNA Technologies notation             |
| AxoLabs                    | AxoLabs oligo notation                           |
| Sequence (1-letter)        | Plain 1-letter amino acid / nucleotide sequence  |
| Sequence (3-letter)        | 3-letter amino acid sequence                     |
| Monomer Library            | Custom monomer definition file                   |

---

## Domain Model

```
Struct (micromolecules)
├── Pool<Atom>
├── Pool<Bond>
├── Pool<SGroup>   ← MonomerMicromolecule (SUP type) bridges macro ↔ micro
├── Pool<Fragment>
└── Pool<RGroup>

DrawingEntitiesManager (macromolecules)
├── Map<id, BaseMonomer>
│   ├── Peptide / Sugar / Phosphate / RNABase / Chem / AmbiguousMonomer
│   └── attachmentPointsToBonds → PolymerBond
├── Map<id, PolymerBond>     ← covalent inter-monomer bonds
├── Map<id, HydrogenBond>    ← H-bonds between bases
├── Map<id, Atom>            ← atoms drawn directly on macro canvas
├── Map<id, Bond>            ← bonds drawn directly on macro canvas
├── Map<id, MonomerToAtomBond>
└── micromoleculesHiddenEntities: Struct ← serialization bridge

ChainsCollection
└── Chain[]
    └── SubChain[] (PeptideSubChain | RnaSubChain | PhosphateSubChain | ChemSubChain)
        └── SubChainNode[] (Nucleotide | Nucleoside | MonomerSequenceNode | …)
```
