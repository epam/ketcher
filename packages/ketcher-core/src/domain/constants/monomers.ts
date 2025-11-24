export enum RNA_DNA_NON_MODIFIED_PART {
  SUGAR_RNA = 'R',
  SUGAR_DNA = 'dR',
  PHOSPHATE = 'P',
}

export enum RnaDnaNaturalAnaloguesEnum {
  ADENINE = 'A',
  THYMINE = 'T',
  GUANINE = 'G',
  CYTOSINE = 'C',
  URACIL = 'U',
}

export enum RnaDnaBaseNames {
  URACIL = 'Uracil',
  THYMINE = 'Thymine',
}

export enum StandardAmbiguousRnaBase {
  N = 'N',
  B = 'B',
  V = 'V',
  D = 'D',
  H = 'H',
  K = 'K',
  M = 'M',
  W = 'W',
  Y = 'Y',
  R = 'R',
  S = 'S',
}

export enum StandardAmbiguousPeptide {
  B = 'B', // Aspartic acid or Asparagine
  J = 'J', // Leucine or Isoleucine
  Z = 'Z', // Glutamic acid or Glutamine
  X = 'X', // Any amino acid
}

export const rnaDnaNaturalAnalogues = [
  RnaDnaNaturalAnaloguesEnum.ADENINE,
  RnaDnaNaturalAnaloguesEnum.THYMINE,
  RnaDnaNaturalAnaloguesEnum.GUANINE,
  RnaDnaNaturalAnaloguesEnum.CYTOSINE,
  RnaDnaNaturalAnaloguesEnum.URACIL,
] as string[];

export const rnaDnaAmbiguousSymbols = [
  StandardAmbiguousRnaBase.N,
  StandardAmbiguousRnaBase.B,
  StandardAmbiguousRnaBase.V,
  StandardAmbiguousRnaBase.D,
  StandardAmbiguousRnaBase.H,
  StandardAmbiguousRnaBase.K,
  StandardAmbiguousRnaBase.M,
  StandardAmbiguousRnaBase.W,
  StandardAmbiguousRnaBase.Y,
  StandardAmbiguousRnaBase.R,
  StandardAmbiguousRnaBase.S,
] as string[];

export const peptideAmbiguousSymbols = [
  StandardAmbiguousPeptide.B,
  StandardAmbiguousPeptide.J,
  StandardAmbiguousPeptide.Z,
  StandardAmbiguousPeptide.X,
] as string[];

export const unknownNaturalAnalogues = ['.', 'X'];
export const peptideNaturalAnalogues = [
  'A',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'V',
  'U',
  'W',
  'Y',
];

export const NO_NATURAL_ANALOGUE = 'X';

export const MONOMER_CONST = {
  AMINO_ACID: 'AminoAcid',
  PEPTIDE: 'PEPTIDE',
  CHEM: 'CHEM',
  RNA: 'RNA',
  DNA: 'DNA',
  MODDNA: 'MODDNA',
  R: 'R', // states for Ribose
  P: 'P', // states for Phosphate
  SUGAR: 'SUGAR',
  BASE: 'BASE',
  PHOSPHATE: 'PHOSPHATE',
};

export const CREATE_MONOMER_TOOL_NAME = 'create-monomer';

export const MonomerSize = 0.75;
// Approximately equal to 15px on the screen and widely used as a measure of checking whether two vectors are in proximity
export const HalfMonomerSize = MonomerSize / 2;
export const StandardBondLength = MonomerSize * 2;
