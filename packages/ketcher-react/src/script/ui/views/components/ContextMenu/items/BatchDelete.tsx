import { fromFragmentDeletion } from 'ketcher-core'
import { useCallback } from 'react'
import { Item, ItemParams } from 'react-contexify'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import {
  ContextMenuShowProps,
  CustomItemProps,
  ItemData
} from '../contextMenu.types'

export const BatchDelete: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()

  const handleClick = useCallback(
    async ({ props }: ItemParams<ContextMenuShowProps, ItemData>) => {
      const editor = getKetcherInstance().editor as Editor

      const itemsToDelete = editor.selection() || {
        bonds: props?.bondIds,
        atoms: props?.atomIds
      }

      const action = fromFragmentDeletion(editor.render.ctab, itemsToDelete)
      editor.update(action)

      editor.selection(null)
    },
    [getKetcherInstance]
  )

  return (
    <Item {...props} onClick={handleClick}>
      Delete
    </Item>
  )
}
