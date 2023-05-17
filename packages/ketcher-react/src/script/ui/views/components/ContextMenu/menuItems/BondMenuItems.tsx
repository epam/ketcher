import { FC } from 'react'
import { Item, Submenu } from 'react-contexify'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from '../ContextMenu.module.less'
import useBondEdit from '../hooks/useBondEdit'
import useBondSGroupAttach from '../hooks/useBondSGroupAttach'
import useBondSGroupEdit from '../hooks/useBondSGroupEdit'
import useBondTypeChange from '../hooks/useBondTypeChange'
import useDelete from '../hooks/useDelete'
import { formatTitle, getNonQueryBondNames, queryBondNames } from '../utils'
import { MenuItemsProps } from '../contextMenu.types'

const nonQueryBondNames = getNonQueryBondNames(tools)

const BondMenuItems: FC<MenuItemsProps> = (props) => {
  const [handleEdit] = useBondEdit()
  const [handleTypeChange] = useBondTypeChange()
  const [handleSGroupAttach, sGroupAttachHidden] = useBondSGroupAttach()
  const [handleSGroupEdit, sGroupEditDisabled, sGroupEditHidden] =
    useBondSGroupEdit()
  const handleDelete = useDelete()

  return (
    <>
      <Item {...props} onClick={handleEdit}>
        {props.propsFromTrigger?.extraItemsSelected
          ? 'Edit selected bonds...'
          : 'Edit...'}
      </Item>

      {nonQueryBondNames.map((name) => (
        <Item {...props} id={name} onClick={handleTypeChange} key={name}>
          <Icon name={name} className={styles.icon} />
          <span>{formatTitle(tools[name].title)}</span>
        </Item>
      ))}

      <Submenu {...props} label="Query bonds" className={styles.subMenu}>
        {queryBondNames.map((name) => (
          <Item id={name} onClick={handleTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        ))}
      </Submenu>

      <Item {...props} hidden={sGroupAttachHidden} onClick={handleSGroupAttach}>
        Attach S-Group...
      </Item>

      <Item
        {...props}
        hidden={sGroupEditHidden}
        disabled={sGroupEditDisabled}
        onClick={handleSGroupEdit}
      >
        Edit S-Group...
      </Item>

      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default BondMenuItems
