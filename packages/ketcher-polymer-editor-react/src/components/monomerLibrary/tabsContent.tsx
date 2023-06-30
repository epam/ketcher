import { MONOMER_TYPES, MONOMER_LIBRARY_FAVORITES } from '../../constants'
import { MonomerList } from './monomerLibraryList'
import { RnaBuilder } from './RnaBuilder'

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
    component: RnaBuilder
  },
  {
    caption: 'CHEM',
    component: () => <></>
  }
]
