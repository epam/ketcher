import type { FC } from 'react';
import { Item, Submenu } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import MenuSeparator from '../MenuSeparator';
import tools from '../../../../action/tools';
import styles from '../ContextMenu.module.less';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useBondEdit from '../hooks/useBondEdit';
import useBondTypeChange from '../hooks/useBondTypeChange';
import useDelete from '../hooks/useDelete';
import useCreateMonomer from '../hooks/useCreateMonomer';
import useMarkAs from '../hooks/useMarkAs';
import {
  getBondTypeName,
  getBondNamesForSelectionContextMenu,
  monomerWizardDisallowedBondNames,
} from '../utils';
import type Editor from 'src/script/editor';
import type {
  MenuItemsProperties,
  SelectionContextMenuProperties,
} from '../contextMenu.types';
import { getIconName, Icon } from 'components';
import { useAppContext } from 'src/hooks';
import HighlightMenu from 'src/script/ui/action/highlightColors/HighlightColors';
import { CREATE_MONOMER_TOOL_NAME, ketcherProvider } from 'ketcher-core';
import isHidden from '../../../../action/isHidden';
import { useSelector } from 'react-redux';
import { optionsSelector } from '../../../../state/options/selectors';
import clsx from 'clsx';
import AttachmentGroupActionMenuItem from './AttachmentGroupActionMenuItem';

const bondNames = getBondNamesForSelectionContextMenu(tools);

const SelectionMenuItems: FC<
  MenuItemsProperties<SelectionContextMenuProperties>
> = (properties) => {
  const { t } = useTranslation(['toolbar', 'components', 'common']);
  const { ketcherId } = useAppContext();
  const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
  const [handleBondEdit, bondEditDisabled] = useBondEdit();
  const [handleAtomEdit, atomEditDisabled] = useAtomEdit();
  const [handleTypeChange, bondTypeChangeDisabled] = useBondTypeChange();
  const [handleAtomStereo, atomStereoDisabled] = useAtomStereo();
  const handleDelete = useDelete();
  const [handleCreateMonomer, createMonomerDisabled] = useCreateMonomer();
  const {
    handler: handleMarkAs,
    isVisible: markAsIsVisible,
    isDisabled: markAsIsDisabled,
  } = useMarkAs();
  const highlightBondWithColor = (color: string) => {
    const bondIds = properties.propsFromTrigger?.bondIds || [];
    const atomIds = properties.propsFromTrigger?.atomIds || [];
    const rgroupAttachmentPoints =
      properties.propsFromTrigger?.rgroupAttachmentPoints || [];

    editor.highlights.create({
      atoms: atomIds,
      bonds: bondIds,
      rgroupAttachmentPoints,
      color: color === '' ? 'transparent' : color,
    });
  };
  const options = useSelector(optionsSelector);
  const showMarkAsMenu = markAsIsVisible();
  const markAsDisabled = markAsIsDisabled();

  return (
    <>
      {showMarkAsMenu && (
        <Submenu
          {...properties}
          data-testid="Mark as a...-option"
          label={t('components:contextMenu.markAsMenu')}
          disabled={markAsDisabled}
          className={styles.subMenu}
        >
          <Item
            {...properties}
            data-testid="Mark as Base-option"
            onClick={handleMarkAs('base')}
          >
            <Icon
              name="base"
              className={clsx(styles.icon, styles.markAsComponentIcon)}
            />
            <span>{t('common:monomerType.base')}</span>
          </Item>
          <Item
            {...properties}
            data-testid="Mark as Sugar-option"
            onClick={handleMarkAs('sugar')}
          >
            <Icon
              name="sugar"
              className={clsx(styles.icon, styles.markAsComponentIcon)}
            />
            <span>{t('common:monomerType.sugar')}</span>
          </Item>
          <Item
            {...properties}
            data-testid="Mark as Phosphate-option"
            onClick={handleMarkAs('phosphate')}
          >
            <Icon
              name="phosphate"
              className={clsx(styles.icon, styles.markAsComponentIcon)}
            />
            <span>{t('common:monomerType.phosphate')}</span>
          </Item>
        </Submenu>
      )}

      <Item
        {...properties}
        data-testid="Edit selected bonds...-option"
        disabled={bondEditDisabled}
        onClick={handleBondEdit}
      >
        {t('components:contextMenu.editSelectedBondsEllipsis')}
      </Item>

      <Item
        {...properties}
        data-testid="Edit selected atoms...-option"
        disabled={atomEditDisabled}
        onClick={handleAtomEdit}
      >
        {t('components:contextMenu.editSelectedAtomsEllipsis')}
      </Item>

      <Submenu
        {...properties}
        data-testid="Bond type-option"
        label={t('components:contextMenu.bondTypeMenu')}
        disabled={bondTypeChangeDisabled}
        className={styles.subMenu}
      >
        {bondNames.map((name) => {
          const iconName = getIconName(name);
          const isDisabledForMonomerWizard =
            editor.isMonomerCreationWizardActive &&
            monomerWizardDisallowedBondNames.includes(name);
          return (
            <Item
              id={name}
              onClick={handleTypeChange}
              key={name}
              disabled={isDisabledForMonomerWizard}
            >
              {iconName && <Icon name={iconName} className={styles.icon} />}
              <span>{getBondTypeName(tools[name], t)}</span>
            </Item>
          );
        })}
      </Submenu>

      {!isHidden(options, CREATE_MONOMER_TOOL_NAME) && (
        <Item
          {...properties}
          data-testid="Create a monomer-option"
          onClick={handleCreateMonomer}
          disabled={createMonomerDisabled}
        >
          {t('components:contextMenu.createMonomerAction')}
        </Item>
      )}

      <AttachmentGroupActionMenuItem {...properties} showCreate />

      <Item
        {...properties}
        data-testid="Enhanced stereochemistry...-option"
        disabled={atomStereoDisabled}
        onClick={handleAtomStereo}
      >
        {t('components:contextMenu.enhancedStereochemistryEllipsis')}
      </Item>
      <HighlightMenu onHighlight={highlightBondWithColor} />
      <MenuSeparator />
      <Item {...properties} data-testid="Delete-option" onClick={handleDelete}>
        {t('common:delete')}
      </Item>
    </>
  );
};

export default SelectionMenuItems;
