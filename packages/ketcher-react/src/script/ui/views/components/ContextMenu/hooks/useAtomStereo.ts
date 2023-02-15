import { findStereoAtoms } from 'ketcher-core'
import { useCallback, useRef } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import EnhancedStereoTool from 'src/script/editor/tool/enhanced-stereo'
import { ItemEventParams } from '../contextMenu.types'
import { noOperation } from '../utils'

const useAtomStereo = () => {
  const { getKetcherInstance } = useAppContext()
  const stereoAtomIdsRef = useRef<number[] | undefined>()

  const handler = useCallback(
    async ({ props }: ItemEventParams) => {
      if (!props || !stereoAtomIdsRef.current) {
        return
      }

      const editor = getKetcherInstance().editor as Editor

      try {
        const action = await EnhancedStereoTool.changeAtomsStereoAction(
          editor,
          stereoAtomIdsRef.current
        )

        action && editor.update(action)
      } catch (error) {
        noOperation()
      }
    },
    [getKetcherInstance]
  )

  const disabled = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const stereoAtomIds: undefined | number[] = findStereoAtoms(
        editor.struct(),
        props?.atomIds
      )
      stereoAtomIdsRef.current = stereoAtomIds

      if (Array.isArray(stereoAtomIds) && stereoAtomIds.length !== 0) {
        return false
      }

      return true
    },
    [getKetcherInstance]
  )

  return [handler, disabled] as const
}

export default useAtomStereo
