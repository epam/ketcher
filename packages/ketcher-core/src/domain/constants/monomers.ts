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

export const rnaDnaNaturalAnalogues = [
  RnaDnaNaturalAnaloguesEnum.ADENINE,
  RnaDnaNaturalAnaloguesEnum.THYMINE,
  RnaDnaNaturalAnaloguesEnum.GUANINE,
  RnaDnaNaturalAnaloguesEnum.CYTOSINE,
  RnaDnaNaturalAnaloguesEnum.URACIL,
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

export const MonomerSize = 0.75;
// Approximately equal to 15px on the screen and widely used as a measure of checking whether two vectors are in proximity
export const HalfMonomerSize = MonomerSize / 2;
export const StandardBondLength = MonomerSize * 2;
