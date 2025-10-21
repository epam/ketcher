import {
  PeptideLetterCodeType,
  SequenceMonomerType,
} from '@tests/pages/constants/monomers/Constants';

export enum SORT_TYPE {
  DESC_X = 'DESC_X',
  DESC_Y = 'DESC_Y',
  ASC_X = 'ASC_X',
  ASC_Y = 'ASC_Y',
}
export type Aromaticity = 'aromatic' | 'aliphatic';
export type Chirality = 'clockwise' | 'anticlockwise';

export interface AtomQueryProperties {
  aromaticity?: Aromaticity | null;
  ringMembership?: number | null;
  ringSize?: number | null;
  connectivity?: number | null;
  chirality?: Chirality | null;
  customQuery?: string | null;
}

export type AtomAttributes = {
  label?: string;
  charge?: number | null;
  valence?: number;
  fragment?: number;
  isotope?: number | null;
  radical?: number;
  explicitValence?: number;
  implicitH?: number;
  ringBondCount?: number;
  implicitHCount?: number | null;
  substitutionCount?: number;
  unsaturatedAtom?: number;
  hCount?: number;
  aam?: number;
  invRet?: number;
  exactChangeFlag?: number;
  rxnFragmentType?: number;
  stereoParity?: number;
  badConn?: boolean;
  pseudo?: string;
  queryProperties?: AtomQueryProperties;
};

// need to get this type from Bond class in ketcher-core package
export enum BondType {
  SINGLE = 1,
  DOUBLE,
  TRIPLE,
  AROMATIC,
  SINGLE_OR_DOUBLE,
  SINGLE_OR_AROMATIC,
  DOUBLE_OR_AROMATIC,
  ANY,
  DATIVE,
  HYDROGEN,
}

export enum Arrows {
  OpenAngle = 'open-angle-arrow',
  FilledTriangle = 'filled-triangle-arrow',
  FilledBow = 'filled-bow-arrow',
  DashedOpenAngle = 'dashed-open-angle-arrow',
  Failed = 'failed-arrow',
  Retrosynthetic = 'retrosynthetic-arrow',
  BothEndsFilledTriangle = 'both-ends-filled-triangle-arrow',
  EquilibriumFilledHalfBow = 'equilibrium-filled-half-bow-arrow',
  EquilibriumFilledTriangle = 'equilibrium-filled-triangle-arrow',
  EquilibriumOpenAngle = 'equilibrium-open-angle-arrow',
  UnbalancedFilledHalfBow = 'unbalanced-equilibrium-filled-half-bow-arrow',
  UnbalancedOpenHalfAngle = 'unbalanced-equilibrium-open-half-angle-arrow',
  UnbalancedLargeFilledHalfBow = 'unbalanced-equilibrium-large-filled-half-bow-arrow',
  UnbalancedFilledHalfTriangle = 'unbalanced-equilibrium-filled-half-triangle-arrow',
  EllipticalArcFilledBow = 'elliptical-arc-arrow-filled-bow-arrow',
  EllipticalArcFilledTriangle = 'elliptical-arc-arrow-filled-triangle-arrow',
  EllipticalArcOpenAngle = 'elliptical-arc-arrow-open-angle-arrow',
  EllipticalArcOpenHalfAngle = 'elliptical-arc-arrow-open-half-angle-arrow',
  MultiTailedArrow = 'multitail-arrow',
}

export enum Pluses {
  Plus = 'rxn-plus',
}

export type BondAttributes = {
  angle?: number;
  begin?: number;
  end?: number;
  hb1?: number;
  hb2?: number;
  len?: number;
  reactingCenterStatus?: number | null;
  sa?: number;
  sb?: number;
  stereo?: number;
  topology?: number | null;
  type?: BondType;
  xxx?: string;
  customQuery?: string | null;
};

export type ArrowXy = { x: number; y: number };
export type PlusXy = { x: number; y: number };
export type AtomXy = AtomAttributes & { x: number; y: number };
export type BondXy = BondAttributes & { x: number; y: number };

export enum ELEMENT_TITLE {
  HYDROGEN = 'Hydrogen (H)',
  BENZENE = 'Benzene (T)',
}

export enum SequenceType {
  RNA = 'RNA',
  DNA = 'DNA',
  PEPTIDE = 'PEPTIDE',
}

export enum MacroFileType {
  KetFormat = 'Ket Format',
  MOLv3000 = 'MDL Molfile V3000',
  Sequence = 'Sequence',
  FASTA = 'FASTA',
  IDT = 'IDT',
  AxoLabs = 'AxoLabs',
  HELM = 'HELM',
}

export type StructureFormat =
  | MacroFileType
  | [MacroFileType.FASTA | MacroFileType.Sequence, SequenceMonomerType]
  | [
      MacroFileType.Sequence,
      [SequenceMonomerType.Peptide, PeptideLetterCodeType],
    ];
