import { MONOMER_TYPES, MONOMER_LIBRARY_FAVORITES } from 'src/constants'
import { MonomerList } from './monomerLibraryList'

export const tabsContent = [
  {
    caption: 'Favorites',
    component: MonomerList,
    props: {
      libraryName: MONOMER_LIBRARY_FAVORITES
    }
  },
  {
    caption: 'Peptides',
    component: MonomerList,
    props: {
      libraryName: MONOMER_TYPES.PEPTIDE
    }
  },
  {
    caption: 'RNA',
    component: () => <></>
  },
  {
    caption: 'CHEM',
    component: () => <></>
  }
]
