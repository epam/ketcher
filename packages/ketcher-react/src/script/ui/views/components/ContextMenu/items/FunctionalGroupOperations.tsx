import {
  fromSgroupDeletion,
  FunctionalGroup,
  setExpandSGroup
} from 'ketcher-core'
import { useCallback } from 'react'
import { Item, ItemParams, PredicateParams } from 'react-contexify'
import { useDispatch } from 'react-redux'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { highlightFG } from 'src/script/ui/state/functionalGroups'
import {
  ContextMenuShowProps,
  CustomItemProps,
  ItemData
} from '../contextMenu.types'

const FunctionalGroupOperations: React.FC<CustomItemProps> = (properties) => {
  const { getKetcherInstance } = useAppContext()
  const dispatch = useDispatch()

  const isExpandHidden = useCallback(
    ({
      props,
      triggerEvent,
      data
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (properties.hidden({ props, triggerEvent, data })) {
        return true
      }

      return props?.closestItem?.isExpanded
    },
    [properties]
  )

  const isContractHidden = useCallback(
    ({
      props,
      triggerEvent,
      data
    }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      if (properties.hidden({ props, triggerEvent, data })) {
        return true
      }

      return !props?.closestItem?.isExpanded
    },
    [properties]
  )

  const handleExpandOrContract = useCallback(
    ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const functionalGroup: FunctionalGroup = props?.closestItem

      const action = setExpandSGroup(
        editor.render.ctab,
        functionalGroup.relatedSGroupId,
        {
          expanded: !functionalGroup.isExpanded
        }
      )

      editor.update(action)
      highlightFG(dispatch, { group: null, id: null })
    },
    [dispatch, getKetcherInstance]
  )

  const handleRemove = useCallback(
    ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const functionalGroup: FunctionalGroup = props?.closestItem

      const action = fromSgroupDeletion(
        editor.render.ctab,
        functionalGroup.relatedSGroupId
      )

      editor.update(action)
      highlightFG(dispatch, { group: null, id: null })
    },
    [dispatch, getKetcherInstance]
  )

  return (
    <>
      <Item
        {...properties}
        hidden={isExpandHidden}
        onClick={handleExpandOrContract}
      >
        Expand Abbreviation
      </Item>
      <Item
        {...properties}
        hidden={isContractHidden}
        onClick={handleExpandOrContract}
      >
        Contract Abbreviation
      </Item>
      <Item {...properties} onClick={handleRemove}>
        Remove Abbreviation
      </Item>
    </>
  )
}

export default FunctionalGroupOperations
