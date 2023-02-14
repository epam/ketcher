import { Item, Submenu } from 'react-contexify'
import tools from 'src/script/ui/action/tools'
import Icon from 'src/script/ui/component/view/icon'
import styles from '../ContextMenu.module.less'
import { CustomItemProps } from '../contextMenu.types'
import useBondEdit from '../hooks/useBondEdit'
import useBondTypeChange from '../hooks/useBondTypeChange'
import useDelete from '../hooks/useDelete'
import useHidden from '../hooks/useHidden'
import { formatTitle, getNonQueryBondNames, queryBondNames } from '../utils'

const nonQueryBondNames = getNonQueryBondNames(tools)

const BondMenuItems: React.FC<CustomItemProps> = (props) => {
  const hidden = useHidden(props.data)
  const [handleEdit] = useBondEdit(props.data)
  const [handleTypeChange] = useBondTypeChange(props.data)
  const handleDelete = useDelete()

  return (
    <>
      <Item {...props} hidden={hidden} onClick={handleEdit}>
        Edit...
      </Item>

      {nonQueryBondNames.map((name) => (
        <Item
          {...props}
          id={name}
          hidden={hidden}
          onClick={handleTypeChange}
          key={name}
        >
          <Icon name={name} className={styles.icon} />
          <span>{formatTitle(tools[name].title)}</span>
        </Item>
      ))}

      <Submenu
        {...props}
        label="Query bonds"
        hidden={hidden}
        className={styles.subMenu}
      >
        {queryBondNames.map((name) => (
          <Item id={name} onClick={handleTypeChange} key={name}>
            <Icon name={name} className={styles.icon} />
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        ))}
      </Submenu>

      <Item {...props} hidden={hidden} onClick={handleDelete}>
        Delete
      </Item>
    </>
  )
}

export default BondMenuItems
