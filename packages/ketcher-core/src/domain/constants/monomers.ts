import { KetMonomerClass } from 'application/formatters';
import { Chem } from 'domain/entities/Chem';
import { Peptide } from 'domain/entities/Peptide';
import { Phosphate } from 'domain/entities/Phosphate';
import { RNABase } from 'domain/entities/RNABase';
import { UnsplitNucleotide } from 'domain/entities/UnsplitNucleotide';
import { Sugar } from 'domain/entities/Sugar';

export enum RNA_DNA_NON_MODIFIED_PART {
  SUGAR_RNA = 'R',
  SUGAR_DNA = 'dR',
  PHOSPHATE = 'P',
}

export const rnaDnaNaturalAnalogues = ['A', 'T', 'G', 'C', 'U'];
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
  'P',
  'Q',
  'R',
  'S',
  'T',
  'V',
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
