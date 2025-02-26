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
  getRnaBaseFromSugar,
  getSugarFromRnaBase,
  BaseMonomer,
  RNABase,
  Sugar,
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
import { isAntisenseCreationDisabled } from 'components/contextMenu/SelectedMonomersContextMenu/helpers';
import { LIBRARY_TAB_INDEX } from 'src/constants';

type SequenceItemContextMenuType = {
  selections?: NodesSelection;
};

export enum SequenceItemContextMenuNames {
  title = 'sequence_menu_title',
  createRnaAntisenseStrand = 'create_rna_antisense_strand',
  createDnaAntisenseStrand = 'create_dna_antisense_strand',
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
  const extractedBaseMonomers: BaseMonomer[] =
    selections?.[0]
      ?.flatMap((item) => {
        const node = item.node as {
          sugar?: BaseMonomer;
          rnaBase?: BaseMonomer;
          phosphate?: BaseMonomer;
          monomer?: BaseMonomer;
        };
        return node
          ? [node.sugar, node.rnaBase, node.phosphate, node.monomer]
          : [];
      })
      .filter(
        (baseMonomer): baseMonomer is BaseMonomer => baseMonomer !== undefined,
      ) || [];

  const isSequenceEditInRNABuilderMode = useAppSelector(
    selectIsSequenceEditInRNABuilderMode,
  );
  const isSequenceMode = useLayoutMode() === ModeTypes.sequence;

  const isAntisenseOptionHidden = ({
    props,
  }: {
    props?: { sequenceItemRenderer?: BaseSequenceItemRenderer };
  }) => {
    return (
      !props?.sequenceItemRenderer ||
      !extractedBaseMonomers?.some((selectedMonomer) => {
        return (
          (selectedMonomer instanceof RNABase &&
            getSugarFromRnaBase(selectedMonomer)) ||
          (selectedMonomer instanceof Sugar &&
            getRnaBaseFromSugar(selectedMonomer))
        );
      })
    );
  };

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
      name: SequenceItemContextMenuNames.createRnaAntisenseStrand,
      title: 'Create RNA antisense strand',
      disabled: isAntisenseCreationDisabled(extractedBaseMonomers),
      hidden: isAntisenseOptionHidden,
    },
    {
      name: SequenceItemContextMenuNames.createDnaAntisenseStrand,
      title: 'Create DNA antisense strand',
      disabled: isAntisenseCreationDisabled(extractedBaseMonomers),
      hidden: isAntisenseOptionHidden,
    },
    {
      name: SequenceItemContextMenuNames.modifyInRnaBuilder,
      title: 'Modify in RNA Builder...',
      disabled:
        !menuProps?.isSelectedOnlyNucleoelements || menuProps.hasAntisense,
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
      case SequenceItemContextMenuNames.createRnaAntisenseStrand:
        editor.events.createAntisenseChain.dispatch(false);
        break;
      case SequenceItemContextMenuNames.createDnaAntisenseStrand:
        editor.events.createAntisenseChain.dispatch(true);
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
