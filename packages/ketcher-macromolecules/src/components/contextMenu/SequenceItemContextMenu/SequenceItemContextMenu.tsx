import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppDispatch, useAppSelector } from 'hooks';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
  selectIsSequenceMode,
} from 'state/common';
import { BaseSequenceItemRenderer, NodesSelection } from 'ketcher-core';
import { setSelectedTabIndex } from 'state/library';
import {
  setSequenceSelection,
  setIsEditMode,
  setSequenceSelectionName,
  setActivePreset,
  setActiveRnaBuilderItem,
  setIsSequenceFirstsOnlyNucleoelementsSelected,
} from 'state/rna-builder';
import { generateSequenceContextMenuProps } from 'components/contextMenu/SequenceItemContextMenu/helpers';
import { ContextMenu } from 'components/contextMenu/ContextMenu';

type SequenceItemContextMenuType = {
  selections?: NodesSelection;
};

const RNA_TAB_INDEX = 2;

export const SequenceItemContextMenu = ({
  selections,
}: SequenceItemContextMenuType) => {
  const editor = useAppSelector(selectEditor);
  const dispatch = useAppDispatch();
  const menuProps = generateSequenceContextMenuProps(selections);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceMode = useAppSelector(selectIsSequenceMode);

  const menuItems = [
    {
      name: 'sequence_menu_title',
      title: menuProps?.title,
      isMenuTitle: true,
      disabled: true,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return (
          !props?.sequenceItemRenderer ||
          !menuProps?.isSelectedAtLeastOneNucleoelement
        );
      },
    },
    {
      name: 'modify_in_rna_builder',
      title: 'Modify in RNA Builder...',
      disabled: !menuProps?.isSelectedOnlyNucleoelements,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return (
          !props?.sequenceItemRenderer ||
          !menuProps?.isSelectedAtLeastOneNucleoelement
        );
      },
    },
    {
      name: 'edit_sequence',
      title: 'Edit sequence',
      disabled: false,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
      }) => {
        return !props?.sequenceItemRenderer;
      },
    },
    {
      name: 'start_new_sequence',
      title: 'Start new sequence',
      disabled: false,
    },
  ];

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case 'modify_in_rna_builder':
        editor.events.turnOnSequenceEditInRNABuilderMode.dispatch();
        dispatch(setSelectedTabIndex(RNA_TAB_INDEX));
        dispatch(setIsEditMode(true));
        dispatch(setActivePreset({}));
        dispatch(setActiveRnaBuilderItem(null));
        if (
          menuProps?.selectedSequenceLabeledNodes?.length &&
          menuProps?.title
        ) {
          dispatch(setSequenceSelectionName(menuProps?.title));
          dispatch(
            setSequenceSelection(menuProps?.selectedSequenceLabeledNodes),
          );
          dispatch(
            setIsSequenceFirstsOnlyNucleoelementsSelected(
              menuProps?.isSequenceFirstsOnlyNucleoelementsSelected,
            ),
          );
        }
        break;
      case 'start_new_sequence':
        editor.events.startNewSequence.dispatch(props.sequenceItemRenderer);
        break;
      case 'edit_sequence':
        editor.events.editSequence.dispatch(props.sequenceItemRenderer);
        break;
      default:
        break;
    }
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  return ketcherEditorRootElement &&
    isSequenceMode &&
    !isSequenceEditInRNABuilderMode
    ? createPortal(
        <ContextMenu
          id={CONTEXT_MENU_ID.FOR_SEQUENCE}
          handleMenuChange={handleMenuChange}
          menuItems={menuItems}
        ></ContextMenu>,
        ketcherEditorRootElement,
      )
    : null;
};
