import { Locator } from '@playwright/test';

export type ClickTarget = Locator | { x: number; y: number };

export enum MonomerOption {
  Copy = 'copy',
  Paste = 'paste',
  CreateAntisenseRNAStrand = 'create_antisense_rna_chain',
  CreateAntisenseDNAStrand = 'create_antisense_dna_chain',
  ModifyAminoAcids = 'modify_amino_acids',
  EditAttachmentPoints = 'edit_attachment_points',
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
  EditAttachmentPoints = 'edit_attachment_points',
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
  QueryBonds = 'Query bonds-option',
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
  CreateAMonomer = 'Create a monomer-option',
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
  ImplicitHCount = 'Implicit H count-option',
  Aromaticity = 'Aromaticity-option',
  RingMembership = 'Ring membership-option',
  RingSize = 'Ring size-option',
  Connectivity = 'Connectivity-option',
  Chirality = 'Chirality-option',
  // CustomQuery = 'Custom Query-option',
  // Inversion = 'Inversion-option',
  // ExactChange = 'Exact change-option',
}

export enum RingBondCountOption {
  None = 'Ring bond count-none-option',
  AsDrawn = 'Ring bond count-As drawn-option',
  Zero = 'Ring bond count-0-option',
  Two = 'Ring bond count-2-option',
  Three = 'Ring bond count-3-option',
  Four = 'Ring bond count-4-option',
  Five = 'Ring bond count-5-option',
  Six = 'Ring bond count-6-option',
  Seven = 'Ring bond count-7-option',
  Eight = 'Ring bond count-8-option',
  Nine = 'Ring bond count-9-option',
}

export enum HCountOption {
  None = 'H count-none-option',
  Zero = 'H count-0-option',
  One = 'H count-1-option',
  Two = 'H count-2-option',
  Three = 'H count-3-option',
  Four = 'H count-4-option',
  Five = 'H count-5-option',
  Six = 'H count-6-option',
  Seven = 'H count-7-option',
  Eight = 'H count-8-option',
  Nine = 'H count-9-option',
}

export enum SubstitutionCountOption {
  None = 'Substitution count-none-option',
  AsDrawn = 'Substitution count-As drawn-option',
  Zero = 'Substitution count-0-option',
  One = 'Substitution count-1-option',
  Two = 'Substitution count-2-option',
  Three = 'Substitution count-3-option',
  Four = 'Substitution count-4-option',
  Five = 'Substitution count-5-option',
  Six = 'Substitution count-6-option',
  Seven = 'Substitution count-7-option',
  Eight = 'Substitution count-8-option',
  Nine = 'Substitution count-9-option',
}

export enum UnsaturatedOption {
  Unsaturated = 'Unsaturated-Unsaturated-option',
  Saturated = 'Unsaturated-Saturated-option',
}

export enum ImplicitHCountOption {
  None = 'Implicit H count-none-option',
  Zero = 'Implicit H count-0-option',
  One = 'Implicit H count-1-option',
  Two = 'Implicit H count-2-option',
  Three = 'Implicit H count-3-option',
  Four = 'Implicit H count-4-option',
  Five = 'Implicit H count-5-option',
  Six = 'Implicit H count-6-option',
  Seven = 'Implicit H count-7-option',
  Eight = 'Implicit H count-8-option',
  Nine = 'Implicit H count-9-option',
}

export enum AromaticityOption {
  None = 'Aromaticity-none-option',
  Aromatic = 'Aromaticity-aromatic-option',
  Aliphatic = 'Aromaticity-aliphatic-option',
}

export enum RingMembershipOption {
  None = 'Ring membership-none-option',
  Zero = 'Ring membership-0-option',
  One = 'Ring membership-1-option',
  Two = 'Ring membership-2-option',
  Three = 'Ring membership-3-option',
  Four = 'Ring membership-4-option',
  Five = 'Ring membership-5-option',
  Six = 'Ring membership-6-option',
  Seven = 'Ring membership-7-option',
  Eight = 'Ring membership-8-option',
  Nine = 'Ring membership-9-option',
}

export enum RingSizeOption {
  None = 'Ring size-none-option',
  Zero = 'Ring size-0-option',
  One = 'Ring size-1-option',
  Two = 'Ring size-2-option',
  Three = 'Ring size-3-option',
  Four = 'Ring size-4-option',
  Five = 'Ring size-5-option',
  Six = 'Ring size-6-option',
  Seven = 'Ring size-7-option',
  Eight = 'Ring size-8-option',
  Nine = 'Ring size-9-option',
}

export enum ConnectivityOption {
  None = 'Connectivity-none-option',
  Zero = 'Connectivity-0-option',
  One = 'Connectivity-1-option',
  Two = 'Connectivity-2-option',
  Three = 'Connectivity-3-option',
  Four = 'Connectivity-4-option',
  Five = 'Connectivity-5-option',
  Six = 'Connectivity-6-option',
  Seven = 'Connectivity-7-option',
  Eight = 'Connectivity-8-option',
  Nine = 'Connectivity-9-option',
}

export enum ChiralityOption {
  None = 'Chirality-none-option',
  Clockwise = 'Chirality-clockwise-option',
  Anticlockwise = 'Chirality-anticlockwise-option',
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

export enum ConnectionPointOption {
  EditConnectionPoint = 'edit-connection-point',
  RemoveAssignment = 'remove-assignment',
  MarkAsLeavingGroup = 'mark-as-leaving-group',
  MarkAsConnectionPoint = 'mark-as-connection-point',
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
  | RingBondCountOption
  | HCountOption
  | SubstitutionCountOption
  | UnsaturatedOption
  | ImplicitHCountOption
  | AromaticityOption
  | RingMembershipOption
  | RingSizeOption
  | ConnectivityOption
  | MultiTailedArrowOption
  | LibraryPresetOption
  | ConnectionPointOption;
