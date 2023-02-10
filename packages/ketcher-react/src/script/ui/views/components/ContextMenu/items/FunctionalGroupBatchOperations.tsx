import { Action, fromSgroupDeletion, setExpandSGroup } from 'ketcher-core'
import { useCallback } from 'react'
import { Item, PredicateParams } from 'react-contexify'
import { useDispatch } from 'react-redux'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { highlightFG } from 'src/script/ui/state/functionalGroups'
import {
  ContextMenuShowProps,
  CustomItemProps,
  ItemData
} from '../contextMenu.types'

const FunctionalGroupBatchOperations: React.FC<CustomItemProps> = (
  properties
) => {
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

      return Boolean(
        props?.functionalGroups?.every(
          (functionalGroup) => functionalGroup.isExpanded
        )
      )
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

      return Boolean(
        props?.functionalGroups?.every(
          (functionalGroup) => !functionalGroup.isExpanded
        )
      )
    },
    [properties]
  )

  const handleExpandOrContract = useCallback(
    (
      { props }: PredicateParams<ContextMenuShowProps, ItemData>,
      expanded: boolean
    ) => {
      const editor = getKetcherInstance().editor as Editor
      const selectedFunctionalGroups = props?.functionalGroups
      const action = new Action()

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          setExpandSGroup(editor.render.ctab, functionalGroup.relatedSGroupId, {
            expanded
          })
        )
      })

      editor.update(action)
      highlightFG(dispatch, { group: null, id: null })
    },
    [dispatch, getKetcherInstance]
  )

  const handleRemove = useCallback(
    ({ props }: PredicateParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor
      const selectedFunctionalGroups = props?.functionalGroups
      const action = new Action()

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          fromSgroupDeletion(
            editor.render.ctab,
            functionalGroup.relatedSGroupId
          )
        )
      })

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
        onClick={(props) => handleExpandOrContract(props, true)}
      >
        Expand Abbreviation
      </Item>
      <Item
        {...properties}
        hidden={isContractHidden}
        onClick={(props) => handleExpandOrContract(props, false)}
      >
        Contract Abbreviation
      </Item>
      <Item {...properties} onClick={handleRemove}>
        Remove Abbreviation
      </Item>
    </>
  )
}

export default FunctionalGroupBatchOperations
