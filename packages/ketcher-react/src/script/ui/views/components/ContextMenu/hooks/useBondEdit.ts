import { fromBondsAttrs } from 'ketcher-core'
import { useCallback } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { ItemEventParams } from '../contextMenu.types'
import { noOperation } from '../utils'

const useBondEdit = () => {
  const { getKetcherInstance } = useAppContext()

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

  const disabled = useCallback(({ props }: ItemEventParams) => {
    const selectedBondIds = props?.bondIds
    if (Array.isArray(selectedBondIds) && selectedBondIds.length !== 0) {
      return false
    }

    return true
  }, [])

  return [handler, disabled] as const
}

export default useBondEdit
