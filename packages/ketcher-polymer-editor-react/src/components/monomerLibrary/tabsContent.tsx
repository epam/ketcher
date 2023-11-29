import { MONOMER_TYPES, MONOMER_LIBRARY_FAVORITES } from '../../constants';
import { MonomerList } from './monomerLibraryList';
import { RnaBuilder } from './RnaBuilder';

export const tabsContent = [
  {
    caption: 'Favorites',
    component: MonomerList,
    testId: 'FAVORITES-TAB',
    props: {
      libraryName: MONOMER_LIBRARY_FAVORITES,
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
