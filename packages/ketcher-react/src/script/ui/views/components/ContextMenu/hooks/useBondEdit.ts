import { fromBondsAttrs } from 'ketcher-core'
import { useCallback } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { ItemData, ItemEventParams } from '../contextMenu.types'
import { noOperation } from '../utils'
import useHidden from './useHidden'

const useBondEdit = (data: ItemData) => {
  const { getKetcherInstance } = useAppContext()
  const hidden = useHidden(data)

  const handler = useCallback(
    async ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const bondIds = props?.bondIds || []
      const bond = editor.render.ctab.bonds.get(bondIds[0])?.b
      try {
        const newBond = await editor.event.bondEdit.dispatch(bond)
        editor.update(fromBondsAttrs(editor.render.ctab, bondIds, newBond))
      } catch (error) {
        noOperation()
      }
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

export default useBondEdit
