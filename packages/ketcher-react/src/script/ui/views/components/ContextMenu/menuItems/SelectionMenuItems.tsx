import { Item, Submenu } from 'react-contexify'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from '../ContextMenu.module.less'
import useAtomEdit from '../hooks/useAtomEdit'
import useAtomStereo from '../hooks/useAtomStereo'
import useBondEdit from '../hooks/useBondEdit'
import useBondTypeChange from '../hooks/useBondTypeChange'
import useDelete from '../hooks/useDelete'
import { formatTitle, getBondNames } from '../utils'

const bondNames = getBondNames(tools)

const SelectionMenuItems: React.FC = (props) => {
  const [handleBondEdit, bondEditDisabled] = useBondEdit()
  const [handleAtomEdit, atomEditDisabled] = useAtomEdit()
  const [handleTypeChange, bondTypeChangeDisabled] = useBondTypeChange()
  const [handleAtomStereo, atomStereoDisabled] = useAtomStereo()
  const handleDelete = useDelete()

  return (
    <>
      <Item {...props} disabled={bondEditDisabled} onClick={handleBondEdit}>
        Edit selected bond(s)...
      </Item>

      <Item {...props} disabled={atomEditDisabled} onClick={handleAtomEdit}>
        Edit selected atom(s)...
      </Item>

      <Submenu
        {...props}
        label="Bond type"
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

      <Item {...props} disabled={atomStereoDisabled} onClick={handleAtomStereo}>
        Enhanced stereochemistry...
      </Item>

      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default SelectionMenuItems
