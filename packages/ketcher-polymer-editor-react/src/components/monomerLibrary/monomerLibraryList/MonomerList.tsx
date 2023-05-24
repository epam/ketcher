import { connect } from 'react-redux'
import { MonomerGroup } from '../monomerLibraryGroup'
import { MonomerItemType } from '../monomerLibraryItem'
import { useEffect, useState } from 'react'

export type Group = {
  groupItems: Array<MonomerItemType>
  groupTitle?: string
}

export interface MonomerListProps {
  libraryName: string
  library: Array<Group>
  searchFilter: string
  st: any
  onItemClick: (item) => void
}

// WILL BE REFACTORED BEFORE MERGE
function getItems(state, libraryName) {
  const result = [...state.editor[libraryName]]
  if (libraryName !== 'favorites') {
    const allFavorites = state.editor.favorites.reduce((a, c) => {
      a = [...a, ...c.groupItems]
      return a
    }, [])
    result.forEach((group, i1) => {
      result[i1] = {
        groupTitle: group.groupTitle,
        groupItems: [...group.groupItems]
      }
      const items = [...group.groupItems]
      items.forEach((item, i2) => {
        const index = allFavorites.findIndex(
          (favoriteItem) => favoriteItem.props.Name === item.props.Name
        )
        if (index !== -1) {
          result[i1].groupItems[i2] = { ...item, favorite: true }
        }
      })
    })
  }
  let final = [...result]
  if (state.editor.searchFilter?.trim()) {
    final = []
    result.forEach((group) => {
      const preResult: any = { groupTitle: group.groupTitle, groupItems: [] }
      group.groupItems.forEach((item) => {
        if (item.props.MonomerName?.match(state.editor.searchFilter)) {
          preResult.groupItems.push(item)
        }
      })
      if (preResult.groupItems.length) {
        final.push(preResult)
      }
    })
  }
  return final
}

const MonomerListComponent = ({
  st,
  libraryName,
  searchFilter,
  onItemClick
}: MonomerListProps) => {
  const [items, setItems] = useState<any>([])

  useEffect(() => {
    setItems(getItems(st, libraryName))
  }, [libraryName, searchFilter, st])

  return (
    <>
      {items.map(({ groupTitle, groupItems }) => {
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

const mapStateToProps = (state, ownProps) => ({
  // TODO: will refactor before merge
  searchFilter: (state) => state.editor.searchFilter,
  library: state.editor[ownProps.libraryName],
  st: state
})

// @ts-ignore
export const MonomerList = connect(mapStateToProps)(MonomerListComponent)
