import { FC, useEffect, useState } from 'react';
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
import { useChangeBondDirection } from '../hooks/useChangeBondDirection';
import { useAppContext } from 'src/hooks/useAppContext';

type Params = ItemEventParams<BondsContextMenuProps>;

const nonQueryBondNames = getNonQueryBondNames(tools);

const BondMenuItems: FC<MenuItemsProps<BondsContextMenuProps>> = (props) => {
  const { getKetcherInstance } = useAppContext();
  const [bondData, setBondData] = useState<{
    type: number;
    stereo: number;
  } | null>(null);
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
  const { changeDirection } = useChangeBondDirection(props as ItemEventParams);
  useEffect(() => {
    const editor = getKetcherInstance()?.editor;
    const bondIds = props.propsFromTrigger?.bondIds || [];

    if (bondIds.length > 0 && editor) {
      const bond = editor.render.ctab.molecule.bonds.get(bondIds[0]);
      if (bond) {
        setBondData({ type: bond.type, stereo: bond.stereo });
      } else {
        setBondData(null);
      }
    }
  }, [props.propsFromTrigger, getKetcherInstance]);

  const shouldShowChangeDirection =
    bondData &&
    ((bondData.type === 9 && bondData.stereo === 0) ||
      (bondData.type === 1 && bondData.stereo === 1) ||
      (bondData.type === 1 && bondData.stereo === 6) ||
      (bondData.type === 1 && bondData.stereo === 4));
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

      {shouldShowChangeDirection && (
        <Item {...props} onClick={changeDirection}>
          Change direction
        </Item>
      )}
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
