import {
  MONOMER_TYPES,
  MONOMER_LIBRARY_FAVORITES,
  FavoriteStarSymbol,
} from '../../constants';
import { MonomerList } from './monomerLibraryList';
import { RnaBuilder } from './RnaBuilder';
import { IRnaPreset } from './RnaBuilder/types';
import { TabsData } from 'components/shared/Tabs';

export const tabsContent = (
  duplicatePreset: (preset?: IRnaPreset) => void,
  editPreset: (preset: IRnaPreset) => void,
): TabsData => [
  {
    caption: FavoriteStarSymbol,
    component: MonomerList,
    testId: 'FAVORITES-TAB',
    props: {
      libraryName: MONOMER_LIBRARY_FAVORITES,
      duplicatePreset,
      editPreset,
    },
  },
  {
    caption: 'Peptides',
    component: MonomerList,
    testId: 'PEPTIDES-TAB',
    props: {
      libraryName: MONOMER_TYPES.PEPTIDE,
    },
  },
  {
    caption: 'RNA',
    testId: 'RNA-TAB',
    component: RnaBuilder,
    props: {
      libraryName: MONOMER_TYPES.RNA,
      duplicatePreset,
      editPreset,
    },
  },
  {
    caption: 'Chem',
    component: MonomerList,
    testId: 'CHEM-TAB',
    props: {
      libraryName: MONOMER_TYPES.CHEM,
    },
  },
];
