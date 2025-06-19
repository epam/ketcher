import { Locator } from '@playwright/test';

export type ClickTarget = Locator | { x: number; y: number };

export enum MonomerOption {
  Copy = 'copy',
  CreateAntisenseRNAStrand = 'create_antisense_rna_chain',
  CreateAntisenseDNAStrand = 'create_antisense_dna_chain',
  ModifyAminoAcids = 'modify_amino_acids',
  Delete = 'delete',
}

export enum ModifyAminoAcidsOption {
  NaturalAminoAcid = 'aminoAcidModification-Natural amino acid',
  Citrullination = 'aminoAcidModification-Citrullination',
  Hydroxylation = 'aminoAcidModification-Hydroxylation',
  Inversion = 'aminoAcidModification-Inversion',
  NMethylation = 'aminoAcidModification-N-methylation',
  Phosphorylation = 'aminoAcidModification-Phosphorylation',
  SideChainAcetylation = 'aminoAcidModification-Side chain acetylation',
}

export enum MonomerOnMicroOption {
  ExpandMonomer = 'Expand monomer-option',
  ExpandMonomers = 'Expand monomers-option',
  CollapseMonomer = 'Collapse monomer-option',
  CollapseMonomers = 'Collapse monomers-option',
}

export enum SuperatomOption {
  ExpandAbbreviation = 'Expand Abbreviation-option',
  ContractAbbreviation = 'Contract Abbreviation-option',
  RemoveAbbreviation = 'Remove Abbreviation-option',
}

export enum MacroBondOption {
  EditConnectionPoints = 'edit_connection_points',
}

export enum SequenceSymbolOption {
  Copy = 'copy',
  Paste = 'paste',
  CreateRNAAntisenseStrand = 'create_antisense_rna_chain',
  CreateDNAAntisenseStrand = 'create_antisense_dna_chain',
  ModifyInRNABuilder = 'modify_in_rna_builder',
  ModifyAminoAcids = 'modify_amino_acids',
  EditSequence = 'edit_sequence',
  StartNewSequence = 'start_new_sequence',
  EstablishHydrogenBonds = 'establish_hydrogen_bond',
  DeleteHydrogenBonds = 'delete_hydrogen_bond',
  Delete = 'delete',
}

export enum MicroBondOption {
  EditSelectedBonds = 'Edit selected bonds...-option',
  Edit = 'Edit...-option',
  Single = 'bond-single-option',
  SingleUp = 'bond-up-option',
  SingleDown = 'bond-down-option',
  SingleUpDown = 'bond-updown-option',
  Double = 'bond-double-option',
  DoubleCisTrans = 'bond-crossed-option',
  Triple = 'bond-triple-option',
  QueryBonds = 'bond-aromatic-option',
  Hydrogen = 'bond-hydrogen-option',
  Dative = 'bond-dative-option',
  ChangeDirection = 'Change direction-option',
  AttachSGroup = 'Attach S-Group...-option',
  EditSGroup = 'Edit S-Group...-option',
  Highlight = 'Highlight-option',
  Delete = 'Delete-option',
}

export enum HighlightOption {
  Red = 'Red-option',
  Orange = 'Orange-option',
  Yellow = 'Yellow-option',
  Green = 'Green-option',
  Blue = 'Blue-option',
  Purple = 'Purple-option',
  Pink = 'Pink-option',
  Magenta = 'Magenta-option',
  NoHighlight = 'No highlight-option',
}

export enum QueryBondOption {
  Any = 'bond-any-option',
  Aromatic = 'bond-aromatic-option',
  SingleDouble = 'bond-singledouble-option',
  SingleAromatic = 'bond-singlearomatic-option',
  DoubleAromatic = 'bond-doublearomatic-option',
}

export enum MicroAtomOption {
  EditSelectedAtoms = 'Edit selected atoms...-option',
  Edit = 'Edit...-option',
  EnhancedStereochemistry = 'Enhanced stereochemistry...-option',
  QueryProperties = 'Query properties-option',
  AddAttachmentPoint = 'Add attachment point-option',
  RemoveAttachmentPoint = 'Remove attachment point-option',
  Highlight = 'Highlight-option',
  Delete = 'Delete-option',
}

export enum QueryAtomOption {
  RingBondCount = 'Ring bond count-option',
  HCount = 'H count-option',
  SubstitutionCount = 'Substitution count-option',
  Unsaturated = 'Unsaturated-option',
  Aromaticity = 'Aromaticity-option',
  ImplicitHCount = 'Implicit H count-option',
  RingMembership = 'Ring membership-option',
  RingSize = 'Ring size-option',
  Connectivity = 'Connectivity-option',
  Chirality = 'Chirality-option',
  CustomQuery = 'Custom Query-option',
  Inversion = 'Inversion-option',
  ExactChange = 'Exact change-option',
}

export enum MultiTailedArrowOption {
  AddNewTail = 'Add new tail-option',
  RemoveTail = 'Remove tail-option',
}

export enum LibraryPresetOption {
  DuplicateAndEdit = 'duplicateandedit',
  Edit = 'edit',
  DeletePreset = 'deletepreset',
}

export type ContextMenuOption =
  | MonomerOption
  | ModifyAminoAcidsOption
  | MonomerOnMicroOption
  | SuperatomOption
  | MacroBondOption
  | SequenceSymbolOption
  | MicroBondOption
  | QueryBondOption
  | HighlightOption
  | MicroAtomOption
  | QueryAtomOption
  | MultiTailedArrowOption
  | LibraryPresetOption;
