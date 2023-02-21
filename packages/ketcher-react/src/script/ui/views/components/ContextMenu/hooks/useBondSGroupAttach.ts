import { ReStruct } from 'ketcher-core'
import { useCallback } from 'react'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import SGroupTool from 'src/script/editor/tool/sgroup'
import { ItemEventParams } from '../contextMenu.types'

const useBondSGroupAttach = () => {
  const { getKetcherInstance } = useAppContext()

  const handler = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const struct: ReStruct = editor.render.ctab
      const bondId = props!.bondIds![0]
      const bond = struct.bonds.get(bondId)!

      const selection = {
        atoms: [bond?.b.begin, bond?.b.end],
        bonds: [bondId]
      }

      editor.selection(selection)
      SGroupTool.sgroupDialog(editor, null)
    },
    [getKetcherInstance]
  )

  const hidden = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor
      const struct: ReStruct = editor.render.ctab
      const bondIds = props!.bondIds!

      if (bondIds.length > 1) {
        return true
      }

      const bond = struct.bonds.get(bondIds[0])!
      const attachedSGroups = bond.b.getAttachedSGroups(struct.molecule)

      return attachedSGroups.size > 0
    },
    [getKetcherInstance]
  )

  return [handler, hidden] as const
}

export default useBondSGroupAttach
