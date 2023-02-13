import { fromBondsAttrs } from 'ketcher-core'
import { useCallback } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import tools from 'src/script/ui/action/tools'
import { ItemData, ItemEventParams } from '../contextMenu.types'
import useHidden from './useHidden'

const useBondTypeChange = (data: ItemData) => {
  const { getKetcherInstance } = useAppContext()
  const hidden = useHidden(data)

  const handler = useCallback(
    ({ id, props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const molecule = editor.render.ctab
      const bondIds = props?.bondIds || []
      const bondProps = tools[id].action.opts

      editor.update(fromBondsAttrs(molecule, bondIds, bondProps))
    },
    [getKetcherInstance]
  )

  const disabled = useCallback(
    ({ props, triggerEvent, data }: ItemEventParams) => {
      if (hidden({ props, triggerEvent, data })) {
        return true
      }

      const selectedBondIds = props?.bondIds
      if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
        return false
      }

      return true
    },
    [hidden]
  )

  return [handler, disabled] as const
}

export default useBondTypeChange
