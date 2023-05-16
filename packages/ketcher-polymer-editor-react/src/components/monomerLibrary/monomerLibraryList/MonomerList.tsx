import { useEffect, useState } from 'react'
import { MonomerGroup } from '../monomerLibraryGroup'
import { MonomerItemType } from '../monomerLibraryItem'

export type Group = {
  groupItems: Array<MonomerItemType>
  groupTitle?: string
}

export interface MonomerListProps {
  list: () => Array<Group>
  onItemClick: (item) => void
  onItemStarClick?: any
}

export const MonomerList = ({ list, onItemClick }: MonomerListProps) => {
  const [filter, setFilter] = useState('')

  const [items, setItems] = useState([...list()])

  useEffect(() => {
    const filteredItems = list().reduce((a, c) => {
      const groupItems = c.groupItems.filter(item => item.label.toLowerCase().match(filter.toLowerCase()))
      if (groupItems.length) {
        // @ts-ignore
        a.push({ groupTitle: c.groupTitle, groupItems })
      }
      return a
    }, [])
    setItems(filteredItems)
  }, [filter, list])

  return (
    <>
      <span>
        <input onInput={(e) => setFilter(e.currentTarget.value)} placeholder='Search..' style={{ display: 'block', margin: '10px auto', width: '90%' }} />
      </span>
      {items.map(({ groupTitle, groupItems }, key) => {
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
