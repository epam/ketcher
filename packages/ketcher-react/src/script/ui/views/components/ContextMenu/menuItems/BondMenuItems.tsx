import { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import tools from 'src/script/ui/action/tools';
import styles from '../ContextMenu.module.less';
import useBondEdit from '../hooks/useBondEdit';
import useBondSGroupAttach from '../hooks/useBondSGroupAttach';
import useBondSGroupEdit from '../hooks/useBondSGroupEdit';
import useBondTypeChange from '../hooks/useBondTypeChange';
import useDelete from '../hooks/useDelete';
import { formatTitle, getNonQueryBondNames, queryBondNames } from '../utils';
import { MenuItemsProps } from '../contextMenu.types';
import { getIconName, Icon } from 'components';

const nonQueryBondNames = getNonQueryBondNames(tools);

const BondMenuItems: FC<MenuItemsProps> = (props) => {
  const [handleEdit] = useBondEdit();
  const [handleTypeChange] = useBondTypeChange();
  const [handleSGroupAttach, sGroupAttachHidden] = useBondSGroupAttach();
  const [handleSGroupEdit, sGroupEditDisabled, sGroupEditHidden] =
    useBondSGroupEdit();
  const handleDelete = useDelete();
  const filteredBondNames = nonQueryBondNames.slice(1);

  return (
    <>
      <Item {...props} onClick={handleEdit}>
        {props.propsFromTrigger?.extraItemsSelected
          ? 'Edit selected bonds...'
          : 'Edit...'}
      </Item>

      {filteredBondNames.map((name) => {
        const iconName = getIconName(name);
        return (
          <Item {...props} id={name} onClick={handleTypeChange} key={name}>
            {iconName && <Icon name={iconName} className={styles.icon} />}
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        );
      })}

      <Submenu {...props} label="Query bonds" className={styles.subMenu}>
        {queryBondNames.map((name) => {
          const iconName = getIconName(name);
          return (
            <Item id={name} onClick={handleTypeChange} key={name}>
              {iconName && <Icon name={iconName} className={styles.icon} />}
              <span>{formatTitle(tools[name].title)}</span>
            </Item>
          );
        })}
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
  );
};

export default BondMenuItems;
