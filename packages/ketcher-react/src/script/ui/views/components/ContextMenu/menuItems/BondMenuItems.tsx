import { type FC, useMemo } from 'react';
import { Item, Submenu } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import type Editor from 'src/script/editor';
import tools from '../../../../action/tools';
import styles from '../ContextMenu.module.less';
import MenuSeparator from '../MenuSeparator';
import useBondEdit from '../hooks/useBondEdit';
import useBondSGroupAttach from '../hooks/useBondSGroupAttach';
import useBondSGroupEdit from '../hooks/useBondSGroupEdit';
import useBondTypeChange from '../hooks/useBondTypeChange';
import useDelete from '../hooks/useDelete';
import {
  getBondTypeName,
  getNonQueryBondNames,
  isBondBetweenMonomers,
  queryBondNames,
} from '../utils';
import type {
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
  const { t } = useTranslation(['toolbar', 'components', 'common']);
  const { ketcherId } = useAppContext();
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

  const bond = useMemo(() => {
    const bondIds = props.propsFromTrigger?.bondIds || [];

    return bondIds.length > 0
      ? (editor.render.ctab.molecule.bonds.get(bondIds[0]) ?? null)
      : null;
  }, [props.propsFromTrigger, editor]);

  const bondData = bond ? { type: bond.type, stereo: bond.stereo } : null;

  const bondBetweenMonomers = useMemo(
    () => isBondBetweenMonomers(bond, editor.render.ctab.molecule),
    [bond, editor],
  );

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

  const disabledForMonomerCreation = editor.isMonomerCreationWizardActive;

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
            ? t('components:contextMenu.editSelectedBondsEllipsis')
            : t('components:contextMenu.editEllipsis')}
        </span>
      </Item>
      <MenuSeparator />
      {bondNamesWithoutEmptyValue.map((name) => {
        const iconName = getIconName(name);
        const classNames = styles.sameGroup;

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
            <span>{getBondTypeName(tools[name], t)}</span>
          </Item>
        );
      })}
      <MenuSeparator />

      <Submenu
        {...props}
        data-testid="Query bonds-option"
        label={t('components:contextMenu.queryBondsMenu')}
        className={styles.subMenu}
        disabled={disabledForMonomerCreation}
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
              <span>{getBondTypeName(tools[name], t)}</span>
            </Item>
          );
        })}
      </Submenu>

      {shouldShowChangeDirection && (
        <Item
          {...props}
          data-testid="Change direction-option"
          onClick={changeDirection}
          disabled={bondBetweenMonomers}
        >
          {t('components:contextMenu.changeDirection')}
        </Item>
      )}
      <Item
        {...props}
        data-testid="Attach S-Group...-option"
        hidden={sGroupAttachHidden}
        onClick={handleSGroupAttach}
        disabled={disabledForMonomerCreation || bondBetweenMonomers}
      >
        {t('components:contextMenu.attachSGroupEllipsis')}
      </Item>
      <HighlightMenu
        onHighlight={highlightBondWithColor}
        disabled={disabledForMonomerCreation}
      />
      <Item
        {...props}
        data-testid="Edit S-Group...-option"
        hidden={sGroupEditHidden}
        disabled={sGroupEditDisabled}
        onClick={handleSGroupEdit}
      >
        {t('components:contextMenu.editSGroupEllipsis')}
      </Item>
      <MenuSeparator />
      <Item {...props} data-testid="Delete-option" onClick={handleDelete}>
        <Icon name="deleteMenu" className={styles.icon} />
        <span className={styles.contextMenuText}>{t('common:delete')}</span>
      </Item>
    </>
  );
};

export default BondMenuItems;
