import { Bases } from '@constants/monomers/Bases';
import { Chem } from '@constants/monomers/Chem';
import { Nucleotides } from '@constants/monomers/Nucleotides';
import { Peptides } from '@constants/monomers/Peptides';
import { Phosphates } from '@constants/monomers/Phosphates';
import { Presets } from '@constants/monomers/Presets';
import { Sugars } from '@constants/monomers/Sugars';
import { Monomer } from '@utils/types';

export const FavoriteStarSymbol = '★' as const;

export enum LibraryTab {
  Favorites = 'FAVORITES-TAB',
  Peptides = 'PEPTIDES-TAB',
  RNA = 'RNA-TAB',
  CHEM = 'CHEM-TAB',
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

type MonomerTypeLocation = {
  libraryTab: LibraryTab;
  rnaSection?: RNASection;
};

export const monomerTypeLocation: Record<
  LibraryMonomerType,
  MonomerTypeLocation
> = {
  [LibraryMonomerType.Peptide]: {
    libraryTab: LibraryTab.Peptides,
  },
  [LibraryMonomerType.Preset]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Presets,
  },
  [LibraryMonomerType.Sugar]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Sugars,
  },
  [LibraryMonomerType.Base]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Bases,
  },
  [LibraryMonomerType.Phosphate]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Phosphates,
  },
  [LibraryMonomerType.Nucleotide]: {
    libraryTab: LibraryTab.RNA,
    rnaSection: RNASection.Nucleotides,
  },
  [LibraryMonomerType.CHEM]: {
    libraryTab: LibraryTab.CHEM,
  },
};

export const rnaSectionArea: Record<RNASection, RNASectionArea> = {
  [RNASection.Presets]: RNASectionArea.Presets,
  [RNASection.Sugars]: RNASectionArea.Sugars,
  [RNASection.Bases]: RNASectionArea.Bases,
  [RNASection.Phosphates]: RNASectionArea.Phosphates,
  [RNASection.Nucleotides]: RNASectionArea.Nucleotides,
};

export const monomerTabMapping: Partial<Record<LibraryMonomerType, Monomer[]>> =
  {
    [LibraryMonomerType.Base]: Object.values(Bases),
    [LibraryMonomerType.CHEM]: Object.values(Chem),
    [LibraryMonomerType.Nucleotide]: Object.values(Nucleotides),
    [LibraryMonomerType.Phosphate]: Object.values(Phosphates),
    [LibraryMonomerType.Peptide]: Object.values(Peptides),
    [LibraryMonomerType.Preset]: Object.values(Presets),
    [LibraryMonomerType.Sugar]: Object.values(Sugars),
  };
