import { MonomerGroup } from '../monomerLibraryGroup'
import { MonomerItemType } from '../monomerLibraryItem'
import {
  selectFilteredMonomers,
  selectMonomersInCategory,
  selectMonomerGroups,
  selectMonomersInFavorites
} from 'state/library'
import { useAppSelector } from 'hooks'
import { MONOMER_LIBRARY_FAVORITES } from '../../../constants'

export type Group = {
  groupItems: Array<MonomerItemType>
  groupTitle?: string
}

export interface MonomerListProps {
  libraryName: string
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
