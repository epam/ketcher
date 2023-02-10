import { useCallback } from 'react'
import { Item } from 'react-contexify'
import { useAppContext } from 'src/hooks'
import Editor from 'src/script/editor'
import EraserTool from 'src/script/editor/tool/eraser'
import { CustomItemProps } from '../contextMenu.types'

export const BatchDelete: React.FC<CustomItemProps> = (props) => {
  const { getKetcherInstance } = useAppContext()

  const handleClick = useCallback(() => {
    const editor = getKetcherInstance().editor as Editor

    // eslint-disable-next-line no-new
    new EraserTool(editor, 0)
  }, [getKetcherInstance])

  return (
    <Item {...props} onClick={handleClick}>
      Delete
    </Item>
  )
}
