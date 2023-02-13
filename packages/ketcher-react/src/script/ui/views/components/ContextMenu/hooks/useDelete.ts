import { fromFragmentDeletion } from 'ketcher-core'
import { useCallback } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import { ItemEventParams } from '../contextMenu.types'

const useDelete = () => {
  const { getKetcherInstance } = useAppContext()

  const handler = useCallback(
    async ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const molecule = editor.render.ctab
      const itemsToDelete = editor.selection() || {
        bonds: props?.bondIds,
        atoms: props?.atomIds
      }

      const action = fromFragmentDeletion(molecule, itemsToDelete)
      editor.update(action)

      editor.selection(null)
    },
    [getKetcherInstance]
  )

  return handler
}

export default useDelete
