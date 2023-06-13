import { MonomerGroup } from '../monomerLibraryGroup'
import {
  selectFilteredMonomers,
  selectMonomersInCategory,
  selectMonomerGroups,
  selectMonomersInFavorites
} from 'state/library'
import { useAppSelector } from 'hooks'
import { LibraryNameType, MONOMER_LIBRARY_FAVORITES } from '../../../constants'
import { MonomerItemType } from '../monomerLibraryItem/types'

export type Group = {
  groupItems: Array<MonomerItemType>
  groupTitle?: string
}

export interface MonomerListProps {
  libraryName: LibraryNameType
  onItemClick: (item) => void
}

const MonomerList = ({ libraryName, onItemClick }: MonomerListProps) => {
  const monomers = useAppSelector(selectFilteredMonomers)
  const items =
    libraryName !== MONOMER_LIBRARY_FAVORITES
      ? selectMonomersInCategory(monomers, libraryName)
      : selectMonomersInFavorites(monomers)
  const groups = selectMonomerGroups(items)

  return (
    <>
      {groups.map(({ groupTitle, groupItems }) => {
        return (
          <MonomerGroup
            key={groupTitle}
            title={groupTitle}
            items={groupItems}
            onItemClick={onItemClick}
          />
        )
      })}
    </>
  )
}

export { MonomerList }
