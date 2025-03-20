import { KetMonomerClass } from 'application/formatters';

export const MONOMER_SYMBOLS_IDS = {
  [KetMonomerClass.AminoAcid]: {
    hover: '#peptide-hover',
    body: '#peptide',
  },
  [KetMonomerClass.CHEM]: {
    hover: '#chem-selection',
    body: '#chem',
  },
  [KetMonomerClass.Sugar]: {
    hover: '#sugar-selection',
    body: '#sugar',
    variant: '#sugar-variant',
  },
  [KetMonomerClass.Base]: {
    hover: '#rna-base-selection',
    body: '#rna-base',
    variant: '#rna-base-variant',
  },
  [KetMonomerClass.Phosphate]: {
    hover: '#phosphate-selection',
    body: '#phosphate',
    variant: '#phosphate-variant',
  },
  [KetMonomerClass.RNA]: {
    hover: '#nucleotide-hover',
    body: '#nucleotide',
  },
};
