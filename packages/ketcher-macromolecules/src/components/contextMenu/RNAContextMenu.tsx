import { ItemParams } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import { openModal } from 'state/modal';
import { useAppDispatch, useAppSelector } from 'hooks';
import { CONTEXT_MENU_ID } from './types';
import { selectCurrentTabIndex, setSelectedTabIndex } from 'state/library';
import { selectActivePresetForContextMenu } from 'state/rna-builder';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { selectIsSequenceEditInRNABuilderMode } from 'state/common';
import { ContextMenu } from 'components/contextMenu/ContextMenu';
import { LIBRARY_TAB_INDEX } from '../../constants';

export const RNAContextMenu = () => {
  const { t } = useTranslation('macromoleculesDialogs');
  const RNA_TAB_INDEX = LIBRARY_TAB_INDEX.RNA;
  const dispatch = useAppDispatch();
  const activePresetForContextMenu = useAppSelector(
    selectActivePresetForContextMenu,
  );
  const selectedTabIndex = useAppSelector(selectCurrentTabIndex);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const RNAMenus = [
    {
      name: 'duplicateandedit',
      title: t('contextMenu.rnaContextMenu.duplicateAndEdit'),
      disabled: false,
    },
    {
      name: 'edit',
      title: t('contextMenu.rnaContextMenu.edit'),
      separator: true,
      disabled: activePresetForContextMenu?.default,
    },
    {
      name: 'deletepreset',
      title: t('contextMenu.rnaContextMenu.deletePreset'),
      disabled: activePresetForContextMenu?.default,
    },
  ];

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case 'duplicateandedit':
        props.duplicatePreset(activePresetForContextMenu);
        if (selectedTabIndex !== RNA_TAB_INDEX) {
          dispatch(setSelectedTabIndex(RNA_TAB_INDEX));
        }
        break;
      case 'edit':
        props.editPreset(activePresetForContextMenu);
        if (selectedTabIndex !== RNA_TAB_INDEX) {
          dispatch(setSelectedTabIndex(RNA_TAB_INDEX));
        }
        break;
      case 'deletepreset':
        dispatch(openModal('delete'));
        break;
    }
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return ketcherEditorRootElement && !isSequenceEditInRNABuilderMode
    ? createPortal(
        <ContextMenu
          id={CONTEXT_MENU_ID.FOR_RNA}
          menuItems={RNAMenus}
          handleMenuChange={handleMenuChange}
        ></ContextMenu>,
        ketcherEditorRootElement,
      )
    : null;
};
