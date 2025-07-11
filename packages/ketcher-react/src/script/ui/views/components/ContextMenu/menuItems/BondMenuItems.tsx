import { FC, useEffect, useState } from 'react';
import { Item, Submenu } from 'react-contexify';
import Editor from 'src/script/editor';
import tools from '../../../../action/tools';
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
import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { ketcherProvider } from 'ketcher-core';

type Params = ItemEventParams<BondsContextMenuProps>;

const nonQueryBondNames = getNonQueryBondNames(tools);

const BondMenuItems: FC<MenuItemsProps<BondsContextMenuProps>> = (props) => {
  const { ketcherId } = useAppContext();
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
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

  useEffect(() => {
    const editor = ketcherProvider.getKetcher(ketcherId)?.editor;
    const bondIds = props.propsFromTrigger?.bondIds || [];

    if (bondIds.length > 0 && editor) {
      const bond = editor.render.ctab.molecule.bonds.get(bondIds[0]);
      if (bond) {
        setBondData({ type: bond.type, stereo: bond.stereo });
      } else {
        setBondData(null);
      }
    }
  }, [props.propsFromTrigger, ketcherId]);

  const highlightBondWithColor = (color: string) => {
    const bondIds = props.propsFromTrigger?.bondIds || [];

    editor.highlights.create({
      atoms: [],
      bonds: bondIds,
      rgroupAttachmentPoints: [],
      color: color === '' ? 'transparent' : color,
    });
  };
  const shouldShowChangeDirection =
    bondData &&
    ((bondData.type === 9 && bondData.stereo === 0) ||
      (bondData.type === 1 && bondData.stereo === 1) ||
      (bondData.type === 1 && bondData.stereo === 6) ||
      (bondData.type === 1 && bondData.stereo === 4));

  return (
    <>
      <Item
        {...props}
        data-testid={
          props.propsFromTrigger?.extraItemsSelected
            ? 'Edit selected bonds...-option'
            : 'Edit...-option'
        }
        onClick={handleEdit}
        disabled={isDisabled}
      >
        <Icon name="editMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>
          {props.propsFromTrigger?.extraItemsSelected
            ? 'Edit selected bonds...'
            : 'Edit...'}
        </span>
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
            data-testid={`${name}-option`}
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

      <Submenu
        {...props}
        data-testid="Query bonds-option"
        label="Query bonds"
        className={styles.subMenu}
      >
        {queryBondNames.map((name) => {
          const iconName = getIconName(name);
          return (
            <Item
              className={styles.sameGroup}
              data-testid={`${name}-option`}
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
        <Item
          {...props}
          data-testid="Change direction-option"
          onClick={changeDirection}
        >
          Change direction
        </Item>
      )}
      <Item
        {...props}
        data-testid="Attach S-Group...-option"
        hidden={sGroupAttachHidden}
        onClick={handleSGroupAttach}
      >
        Attach S-Group...
      </Item>
      <HighlightMenu onHighlight={highlightBondWithColor} />
      <Item
        {...props}
        data-testid="Edit S-Group...-option"
        hidden={sGroupEditHidden}
        disabled={sGroupEditDisabled}
        onClick={handleSGroupEdit}
      >
        Edit S-Group...
      </Item>
      <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
        <Icon name="deleteMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>Delete</span>
      </Item>
    </>
  );
};

export default BondMenuItems;
