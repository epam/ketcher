import { Action, setExpandSGroup } from 'ketcher-core'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { highlightFG } from 'src/script/ui/state/functionalGroups'
import { ItemData, ItemEventParams } from '../contextMenu.types'
import useHidden from './useHidden'

/**
 * Fullname: useFunctionalGroupExpandOrContract
 */
const useFunctionalGroupEoc = (data: ItemData) => {
  const { getKetcherInstance } = useAppContext()
  const dispatch = useDispatch()
  const hidden = useHidden(data)

  const handler = useCallback(
    ({ props }: ItemEventParams, toExpand: boolean) => {
      const editor = getKetcherInstance().editor as Editor
      const molecule = editor.render.ctab
      const selectedFunctionalGroups = props?.functionalGroups
      const action = new Action()

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          setExpandSGroup(molecule, functionalGroup.relatedSGroupId, {
            expanded: toExpand
          })
        )
      })

      editor.update(action)
      highlightFG(dispatch, { group: null, id: null })
    },
    [dispatch, getKetcherInstance]
  )

  const disabled = useCallback(
    ({ props, triggerEvent, data }: ItemEventParams, toExpand: boolean) => {
      if (hidden({ props, triggerEvent, data })) {
        return true
      }

      return Boolean(
        props?.functionalGroups?.every((functionalGroup) =>
          toExpand ? functionalGroup.isExpanded : !functionalGroup.isExpanded
        )
      )
    },
    [hidden]
  )

  return [handler, disabled] as const
}

export default useFunctionalGroupEoc
