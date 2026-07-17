import type { KetMonomerClass } from 'application/formatters/types/ket';

export const UNRESOLVED_MONOMER_COLOR = '#585858';

export const BAD_VALENCE_WARNING_COLOR = '#F00';
export const BAD_VALENCE_LINE_OFFSET = 2;

export const SELECTION_COLOR = '#57FF8F';
export const SELECTION_HOVERED_COLOR = '#CCFFDD';

export const MONOMER_SYMBOLS_IDS: Partial<
  Record<
    KetMonomerClass,
    {
      hover: string;
      body: string;
      variant?: string;
      autochainPreview: string;
    }
  >
> = {
  AminoAcid: {
    hover: '#peptide-hover',
    body: '#peptide',
    autochainPreview: '#peptide-autochain-preview',
  },
  CHEM: {
    hover: '#chem-selection',
    body: '#chem',
    autochainPreview: '#chem-autochain-preview',
  },
  Sugar: {
    hover: '#sugar-selection',
    body: '#sugar',
    variant: '#sugar-variant',
    autochainPreview: '#sugar-autochain-preview',
  },
  Base: {
    hover: '#rna-base-selection',
    body: '#rna-base',
    variant: '#rna-base-variant',
    autochainPreview: '#rna-base-autochain-preview',
  },
  Phosphate: {
    hover: '#phosphate-selection',
    body: '#phosphate',
    variant: '#phosphate-variant',
    autochainPreview: '#phosphate-autochain-preview',
  },
  RNA: {
    hover: '#nucleotide-hover',
    body: '#nucleotide',
    autochainPreview: '#nucleotide-autochain-preview',
  },
};
