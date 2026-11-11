import type { TFunction } from 'i18next';
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
  t: TFunction,
  duplicatePreset: (preset?: IRnaPreset) => void,
  editPreset: (preset: IRnaPreset) => void,
): TabsData => [
  {
    caption: FavoriteStarSymbol,
    tooltip: t('monomerLibrary.favoritesTooltip'),
    component: MonomerList,
    testId: 'FAVORITES-TAB',
    props: {
      libraryName: MONOMER_LIBRARY_FAVORITES,
      duplicatePreset,
      editPreset,
    },
  },
  {
    caption: t('monomerLibrary.peptidesTab'),
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
    caption: 'CHEM',
    component: MonomerList,
    testId: 'CHEM-TAB',
    props: {
      libraryName: MONOMER_TYPES.CHEM,
    },
  },
];
