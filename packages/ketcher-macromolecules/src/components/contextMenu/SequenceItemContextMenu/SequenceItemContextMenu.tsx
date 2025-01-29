import { ItemParams } from 'react-contexify';
import { CONTEXT_MENU_ID } from '../types';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import { useAppDispatch, useAppSelector, useLayoutMode } from 'hooks';
import {
  selectEditor,
  selectIsSequenceEditInRNABuilderMode,
} from 'state/common';
import {
  BaseSequenceItemRenderer,
  ModeTypes,
  NodesSelection,
} from 'ketcher-core';
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
import { LIBRARY_TAB_INDEX } from 'src/constants';

type SequenceItemContextMenuType = {
  selections?: NodesSelection;
};

export enum SequenceItemContextMenuNames {
  title = 'sequence_menu_title',
  modifyInRnaBuilder = 'modify_in_rna_builder',
  editSequence = 'edit_sequence',
  startNewSequence = 'start_new_sequence',
}

export const SequenceItemContextMenu = ({
  selections,
}: SequenceItemContextMenuType) => {
  const editor = useAppSelector(selectEditor);
  const dispatch = useAppDispatch();
  const menuProps = generateSequenceContextMenuProps(selections);
  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceMode = useLayoutMode() === ModeTypes.sequence;

  const menuItems = [
    {
      name: SequenceItemContextMenuNames.title,
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
      name: SequenceItemContextMenuNames.modifyInRnaBuilder,
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
      name: SequenceItemContextMenuNames.editSequence,
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
      name: SequenceItemContextMenuNames.startNewSequence,
      title: 'Start new sequence',
      disabled: false,
    },
  ];

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case SequenceItemContextMenuNames.modifyInRnaBuilder:
        editor.events.turnOnSequenceEditInRNABuilderMode.dispatch();
        dispatch(setSelectedTabIndex(LIBRARY_TAB_INDEX.RNA));
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
      case SequenceItemContextMenuNames.startNewSequence:
        editor.events.startNewSequence.dispatch(props.sequenceItemRenderer);
        break;
      case SequenceItemContextMenuNames.editSequence:
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
