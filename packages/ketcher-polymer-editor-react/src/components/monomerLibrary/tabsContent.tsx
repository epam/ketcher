import { MONOMER_TYPES, MONOMER_LIBRARY_FAVORITES } from '../../constants';
import { MonomerList } from './monomerLibraryList';
import { RnaBuilder } from './RnaBuilder';

export const tabsContent = (duplicatePreset, editPreset) => [
  {
    caption: 'Favorites',
    component: MonomerList,
    testId: 'FAVORITES_TAB',
    props: {
      libraryName: MONOMER_LIBRARY_FAVORITES,
      duplicatePreset,
      editPreset,
    },
  },
  {
    caption: 'Peptides',
    component: MonomerList,
    testId: 'PEPTIDES_TAB',
    props: {
      libraryName: MONOMER_TYPES.PEPTIDE,
    },
  },
  {
    caption: 'RNA',
    testId: 'RNA_TAB',
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
    testId: 'CHEM_TAB',
    props: {
      libraryName: MONOMER_TYPES.CHEM,
    },
  },
];
