import { MonomerList } from './monomerLibraryList'

export const tabsContent = [
  {
    caption: 'Favorites',
    component: MonomerList,
    props: {
      libraryName: 'favorites'
    }
  },
  {
    caption: 'Peptides',
    component: MonomerList,
    props: {
      libraryName: 'peptides'
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
