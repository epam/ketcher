import { MONOMER_TYPES, MONOMER_LIBRARY_FAVORITES } from '../../constants';
import { MonomerList } from './monomerLibraryList';
import { RnaBuilder } from './RnaBuilder';

export const tabsContent = (duplicatePreset, editPreset) => [
  {
    caption: 'Favorites',
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
    caption: 'CHEM',
    component: MonomerList,
    testId: 'CHEM-TAB',
    props: {
      libraryName: MONOMER_TYPES.CHEM,
    },
  },
];
