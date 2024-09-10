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
import {
  BondsContextMenuProps,
  ItemEventParams,
  MenuItemsProps,
} from '../contextMenu.types';
import { getIconName, Icon } from 'components';

type Params = ItemEventParams<BondsContextMenuProps>;

const nonQueryBondNames = getNonQueryBondNames(tools);

const BondMenuItems: FC<MenuItemsProps<BondsContextMenuProps>> = (props) => {
  const [handleEdit] = useBondEdit();
  const [handleTypeChange, disabled] = useBondTypeChange();
  const [handleSGroupAttach, sGroupAttachHidden] = useBondSGroupAttach();
  const [handleSGroupEdit, sGroupEditDisabled, sGroupEditHidden] =
    useBondSGroupEdit();
  const handleDelete = useDelete();
  const bondNamesWithoutEmptyValue = nonQueryBondNames.slice(1);
  const isDisabled = disabled({
    props: props.propsFromTrigger,
  } as Params);
  return (
    <>
      <Item {...props} onClick={handleEdit} disabled={isDisabled}>
        {props.propsFromTrigger?.extraItemsSelected
          ? 'Edit selected bonds...'
          : 'Edit...'}
      </Item>

      {bondNamesWithoutEmptyValue.map((name, i) => {
        const iconName = getIconName(name);
        const classNames =
          styles.sameGroup +
          (i === bondNamesWithoutEmptyValue.length - 1 ? styles.devider : '');

        return (
          <Item
            className={classNames}
            {...props}
            id={name}
            onClick={handleTypeChange}
            key={name}
            disabled={isDisabled}
          >
            {iconName && <Icon name={iconName} className={styles.icon} />}
            <span>{formatTitle(tools[name].title)}</span>
          </Item>
        );
      })}

      <Submenu {...props} label="Query bonds" className={styles.subMenu}>
        {queryBondNames.map((name) => {
          const iconName = getIconName(name);
          return (
            <Item
              className={styles.sameGroup}
              id={name}
              onClick={handleTypeChange}
              key={name}
              disabled={isDisabled}
            >
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
