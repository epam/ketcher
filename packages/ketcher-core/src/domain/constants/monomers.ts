import { KetMonomerClass } from 'application/formatters';
import {
  Sugar,
  UnsplitNucleotide,
  RNABase,
  Phosphate,
  Peptide,
  Chem,
} from 'domain/entities/internal';

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

export const MONOMER_CLASS_TO_CONSTRUCTOR = {
  [KetMonomerClass.CHEM]: Chem,
  [KetMonomerClass.AminoAcid]: Peptide,
  [KetMonomerClass.Phosphate]: Phosphate,
  [KetMonomerClass.Sugar]: Sugar,
  [KetMonomerClass.Base]: RNABase,
  [KetMonomerClass.RNA]: UnsplitNucleotide,
};
