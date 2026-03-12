import {
  MONOMER_TYPES,
  MONOMER_LIBRARY_FAVORITES,
  FavoriteStarSymbol,
} from '../../constants';
import { MonomerList } from './monomerLibraryList';
import { RnaBuilder } from './RnaBuilder';
import { IRnaPreset } from './RnaBuilder/types';
import { TabComponent, TabsData } from 'components/shared/Tabs';

export const tabsContent = (
  duplicatePreset: (preset?: IRnaPreset) => void,
  editPreset: (preset: IRnaPreset) => void,
): TabsData => [
  {
    caption: FavoriteStarSymbol,
    tooltip: 'Favorites',
    component: MonomerList as unknown as TabComponent,
    testId: 'FAVORITES-TAB',
    props: {
      libraryName: MONOMER_LIBRARY_FAVORITES,
      duplicatePreset,
      editPreset,
    },
  },
  {
    caption: 'Peptides',
    component: MonomerList as unknown as TabComponent,
    testId: 'PEPTIDES-TAB',
    props: {
      libraryName: MONOMER_TYPES.PEPTIDE,
    },
  },
  {
    caption: 'RNA',
    testId: 'RNA-TAB',
    component: RnaBuilder as unknown as TabComponent,
    props: {
      libraryName: MONOMER_TYPES.RNA,
      duplicatePreset,
      editPreset,
    },
  },
  {
    caption: 'CHEM',
    component: MonomerList as unknown as TabComponent,
    testId: 'CHEM-TAB',
    props: {
      libraryName: MONOMER_TYPES.CHEM,
    },
  },
];
