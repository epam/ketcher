import { Item, Submenu } from 'react-contexify'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from '../ContextMenu.module.less'
import { CustomItemProps } from '../contextMenu.types'
import useAtomEdit from '../hooks/useAtomEdit'
import useAtomStereo from '../hooks/useAtomStereo'
import useBondEdit from '../hooks/useBondEdit'
import useBondTypeChange from '../hooks/useBondTypeChange'
import useDelete from '../hooks/useDelete'
import useHidden from '../hooks/useHidden'
import { formatTitle, getBondNames } from '../utils'

const bondNames = getBondNames(tools)

const SelectionMenuItems: React.FC<CustomItemProps> = (props) => {
  const hidden = useHidden(props.data)
  const [handleBondEdit, bondEditDisabled] = useBondEdit(props.data)
  const [handleAtomEdit, atomEditDisabled] = useAtomEdit(props.data)
  const [handleTypeChange, bondTypeChangeDisabled] = useBondTypeChange(
    props.data
  )
  const [handleAtomStereo, atomStereoDisabled] = useAtomStereo(props.data)
  const handleDelete = useDelete()

  return (
    <>
      <Item
        {...props}
        hidden={hidden}
        disabled={bondEditDisabled}
        onClick={handleBondEdit}
      >
        Edit selected bond(s)...
      </Item>

      <Item
        {...props}
        hidden={hidden}
        disabled={atomEditDisabled}
        onClick={handleAtomEdit}
      >
        Edit selected atom(s)...
      </Item>

      <Submenu
        {...props}
        label="Bond type"
        hidden={hidden}
        disabled={bondTypeChangeDisabled}
        className={styles.subMenu}
      >
        {bondNames.map((name) => (
          <Item id={name} onClick={handleTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        ))}
      </Submenu>

      <Item
        {...props}
        hidden={hidden}
        disabled={atomStereoDisabled}
        onClick={handleAtomStereo}
      >
        Enhanced stereochemistry...
      </Item>

      <Item {...props} hidden={hidden} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default SelectionMenuItems
