import { KetMonomerClass } from 'application/formatters';

export const MONOMER_SYMBOLS_IDS = {
  [KetMonomerClass.AminoAcid]: {
    hover: '#peptide-hover',
    body: '#peptide',
    autochainPreview: '#peptide-autochain-preview',
  },
  [KetMonomerClass.CHEM]: {
    hover: '#chem-selection',
    body: '#chem',
    autochainPreview: '#chem-autochain-preview',
  },
  [KetMonomerClass.Sugar]: {
    hover: '#sugar-selection',
    body: '#sugar',
    variant: '#sugar-variant',
    autochainPreview: '#sugar-autochain-preview',
  },
  [KetMonomerClass.Base]: {
    hover: '#rna-base-selection',
    body: '#rna-base',
    variant: '#rna-base-variant',
    autochainPreview: '#rna-base-autochain-preview',
  },
  [KetMonomerClass.Phosphate]: {
    hover: '#phosphate-selection',
    body: '#phosphate',
    variant: '#phosphate-variant',
    autochainPreview: '#phosphate-autochain-preview',
  },
  [KetMonomerClass.RNA]: {
    hover: '#nucleotide-hover',
    body: '#nucleotide',
    autochainPreview: '#nucleotide-autochain-preview',
  },
};
