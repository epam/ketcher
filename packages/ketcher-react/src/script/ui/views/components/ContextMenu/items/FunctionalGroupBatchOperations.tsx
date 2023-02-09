import {
  Action,
  fromSgroupDeletion,
  FunctionalGroup,
  setExpandSGroup
} from 'ketcher-core'
import { useCallback } from 'react'
import { Item } from 'react-contexify'
import { useDispatch } from 'react-redux'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { highlightFG } from 'src/script/ui/state/functionalGroups'
import { CustomItemProps } from '../contextMenu.types'

const FunctionalGroupBatchOperations: React.FC<CustomItemProps> = (
  properties
) => {
  const { getKetcherInstance } = useAppContext()
  const dispatch = useDispatch()

  const getSelectedFunctionalGroupIds = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const struct = editor.struct()
    const selectedAtomIds = editor.selection()?.atoms
    const selectedFunctionalGroupIds = new Set<number>()

    selectedAtomIds?.forEach((atomId) => {
      const functionalGroupId = FunctionalGroup.findFunctionalGroupByAtom(
        struct.functionalGroups,
        atomId
      )

      functionalGroupId !== null &&
        selectedFunctionalGroupIds.add(functionalGroupId)
    })

    return selectedFunctionalGroupIds
  }, [getKetcherInstance])

  const handleExpandOrContract = useCallback(
    (expanded: boolean) => {
      const editor = getKetcherInstance().editor as Editor
      const selectedFunctionalGroupIds = getSelectedFunctionalGroupIds()
      const action = new Action()

      selectedFunctionalGroupIds.forEach((id) => {
        action.mergeWith(
          setExpandSGroup(editor.render.ctab, id, {
            expanded
          })
        )
      })

      editor.update(action)
      highlightFG(dispatch, { group: null, id: null })
    },
    [dispatch, getKetcherInstance, getSelectedFunctionalGroupIds]
  )

  const handleRemove = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor
    const selectedFunctionalGroupIds = getSelectedFunctionalGroupIds()
    const action = new Action()

    selectedFunctionalGroupIds.forEach((id) => {
      action.mergeWith(fromSgroupDeletion(editor.render.ctab, id))
    })

    editor.update(action)
    highlightFG(dispatch, { group: null, id: null })
  }, [dispatch, getKetcherInstance, getSelectedFunctionalGroupIds])

  return (
    <>
      <Item {...properties} onClick={() => handleExpandOrContract(true)}>
        Expand Abbreviation
      </Item>
      <Item {...properties} onClick={() => handleExpandOrContract(false)}>
        Contract Abbreviation
      </Item>
      <Item {...properties} onClick={handleRemove}>
        Remove Abbreviation
      </Item>
    </>
  )
}

export default FunctionalGroupBatchOperations
