import { KetMonomerClass } from 'application/formatters';

export const MONOMER_SYMBOLS_IDS = {
  [KetMonomerClass.AminoAcid]: {
    hover: '#peptide-hover',
    selected: '#peptide-selection',
    body: '#peptide',
  },
  [KetMonomerClass.CHEM]: {
    hover: '#chem-selection',
    selected: '#chem-selection',
    body: '#chem',
  },
  [KetMonomerClass.Sugar]: {
    hover: '#sugar-selection',
    selected: '#sugar-selection',
    body: '#sugar',
  },
  [KetMonomerClass.Base]: {
    hover: '#rna-base-selection',
    selected: '#rna-base-selection',
    body: '#rna-base',
    variant: '#rna-base-variant',
  },
  [KetMonomerClass.Phosphate]: {
    hover: '#phosphate-selection',
    selected: '#phosphate-selection',
    body: '#phosphate',
  },
  [KetMonomerClass.RNA]: {
    hover: '#nucleotide-hover',
    selected: '#nucleotide-selection',
    body: '#nucleotide',
  },
};
