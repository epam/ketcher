import { MonomerType } from '@utils/types';

export const FavoriteStarSymbol = '★' as const;

export enum LibraryTab {
  Favorites = 'FAVORITES-TAB',
  Peptides = 'PEPTIDES-TAB',
  RNA = 'RNA-TAB',
  CHEM = 'CHEM-TAB',
  none = '',
}

export enum RNASection {
  Presets = 'summary-Presets',
  Sugars = 'summary-Sugars',
  Bases = 'summary-Bases',
  Phosphates = 'summary-Phosphates',
  Nucleotides = 'summary-Nucleotides',
}

export enum RNASectionArea {
  Presets = 'rna-accordion-details-Presets',
  Sugars = 'rna-accordion-details-Sugars',
  Bases = 'rna-accordion-details-Bases',
  Phosphates = 'rna-accordion-details-Phosphates',
  Nucleotides = 'rna-accordion-details-Nucleotides',
}

export enum LibraryMonomerType {
  Peptide,
  Preset,
  Sugar,
  Base,
  Phosphate,
  Nucleotide,
  CHEM,
}

export type MonomerTypeLocation = {
  libraryTab: LibraryTab;
  rnaSection?: RNASection;
};

export const rnaTabPresetsSection = {
  libraryTab: LibraryTab.RNA,
  rnaSection: RNASection.Presets,
};

export const monomerLibraryTypeLocation: Record<
  MonomerType,
  MonomerTypeLocation
> = {
  [MonomerType.Peptide]: {
    libraryTab: LibraryTab.Peptides,
  },
  [MonomerType.Preset]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Presets,
  },
  [MonomerType.Sugar]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Sugars,
  },
  [MonomerType.Base]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Bases,
  },
  [MonomerType.Phosphate]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Phosphates,
  },
  [MonomerType.Nucleotide]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Nucleotides,
  },
  [MonomerType.CHEM]: {
    libraryTab: LibraryTab.CHEM,
  },
  [MonomerType.Atom]: { libraryTab: LibraryTab.none },
};

export const rnaSectionArea: Record<RNASection, RNASectionArea> = {
  [RNASection.Presets]: RNASectionArea.Presets,
  [RNASection.Sugars]: RNASectionArea.Sugars,
  [RNASection.Bases]: RNASectionArea.Bases,
  [RNASection.Phosphates]: RNASectionArea.Phosphates,
  [RNASection.Nucleotides]: RNASectionArea.Nucleotides,
};
