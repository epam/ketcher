import { Item } from 'react-contexify'
import useAtomEdit from '../hooks/useAtomEdit'
import useAtomStereo from '../hooks/useAtomStereo'
import useDelete from '../hooks/useDelete'

const AtomMenuItems: React.FC = (props) => {
  const [handleEdit] = useAtomEdit()
  const [handleStereo, stereoDisabled] = useAtomStereo()
  const handleDelete = useDelete()

  return (
    <>
      <Item {...props} onClick={handleEdit}>
        Edit...
      </Item>

      <Item {...props} disabled={stereoDisabled} onClick={handleStereo}>
        Enhanced stereochemistry...
      </Item>

      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default AtomMenuItems
