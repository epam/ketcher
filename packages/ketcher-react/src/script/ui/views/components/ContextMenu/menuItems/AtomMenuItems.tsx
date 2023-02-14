import { Item } from 'react-contexify'
import { CustomItemProps } from '../contextMenu.types'
import useAtomEdit from '../hooks/useAtomEdit'
import useAtomStereo from '../hooks/useAtomStereo'
import useDelete from '../hooks/useDelete'
import useHidden from '../hooks/useHidden'

const AtomMenuItems: React.FC<CustomItemProps> = (props) => {
  const hidden = useHidden(props.data)
  const [handleEdit] = useAtomEdit(props.data)
  const [handleStereo, stereoDisabled] = useAtomStereo(props.data)
  const handleDelete = useDelete()

  return (
    <>
      <Item {...props} hidden={hidden} onClick={handleEdit}>
        Edit...
      </Item>

      <Item
        {...props}
        hidden={hidden}
        disabled={stereoDisabled}
        onClick={handleStereo}
      >
        Enhanced stereochemistry...
      </Item>

      <Item {...props} hidden={hidden} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default AtomMenuItems
