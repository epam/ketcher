import { MonomerGroup } from '../monomerLibraryGroup'
import { MonomerItemType } from '../monomerLibraryItem'

export type Group = {
  groupItems: Array<MonomerItemType>
  groupTitle?: string
}

export interface MonomerListProps {
  list: Array<Group>
  onItemClick: (item) => void
}

export const MonomerList = ({ list, onItemClick }: MonomerListProps) => {
  return (
    <>
      {list.map(({ groupTitle, groupItems }, key) => {
        return (
          <MonomerGroup
            key={key}
            title={groupTitle}
            items={groupItems}
            onItemClick={onItemClick}
          />
        )
      })}
    </>
  )
}
