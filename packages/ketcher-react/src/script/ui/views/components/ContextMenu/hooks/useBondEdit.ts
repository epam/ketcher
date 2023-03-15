import { useCallback } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { updateSelectedBonds } from 'src/script/ui/state/modal/bonds'
import { mapBondIdsToBonds } from 'src/script/editor/tool/select'
import { ItemEventParams } from '../contextMenu.types'
import { noOperation } from '../utils'

const useBondEdit = () => {
  const { getKetcherInstance } = useAppContext()

  const handler = useCallback(
    async ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const bondIds = props?.bondIds || []
      const molecule = editor.render.ctab
      try {
        const bonds = mapBondIdsToBonds(bondIds, molecule)
        const changeBondPromise = await editor.event.bondEdit.dispatch(bonds)
        updateSelectedBonds({ bonds: bondIds, changeBondPromise, editor })
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
