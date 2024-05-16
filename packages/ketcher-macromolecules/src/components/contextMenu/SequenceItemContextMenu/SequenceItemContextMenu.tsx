import { Item, ItemParams } from 'react-contexify';
import { ReactElement, useEffect } from 'react';
import { CONTEXT_MENU_ID } from '../types';
import { StyledMenu } from '../styles';
import { createPortal } from 'react-dom';
import { KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR } from 'ketcher-react';
import {
  useAppDispatch,
  useAppSelector,
  useSequenceEditInRNABuilderMode,
} from 'hooks';
import { selectEditor } from 'state/common';
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
  const isSequenceEditInRNABuilderMode = useSequenceEditInRNABuilderMode();

  const menuItems = [
    {
      name: 'sequence_menu_title',
      title: menuProps?.title,
      isMenuTitle: true,
      disabled: true,
      hidden: ({
        props,
      }: {
        props?: { sequenceItemRenderer: BaseSequenceItemRenderer };
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
        props?: { sequenceItemRenderer: BaseSequenceItemRenderer };
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
        props?: { sequenceItemRenderer: BaseSequenceItemRenderer };
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

  const assembleMenuItems = () => {
    const items: ReactElement[] = [];

    menuItems.forEach(({ name, title, hidden, disabled, isMenuTitle }) => {
      const item = (
        <Item
          id={name}
          onClick={handleMenuChange}
          key={name}
          data-testid={name}
          hidden={hidden}
          disabled={disabled}
          className={isMenuTitle ? 'contexify_item-title' : ''}
        >
          <span>{title}</span>
        </Item>
      );
      items.push(item);
    });
    return items;
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_MACROMOLECULES_ROOT_NODE_SELECTOR,
  );

  useEffect(() => {
    const handleKeyPress = (event) => {
      const unselectButtons =
        event.key === 'Escape' || (event.shiftKey && event.key === 'Tab');
      if (unselectButtons && isSequenceEditInRNABuilderMode) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', handleKeyPress, true);

    return () => {
      window.removeEventListener('keydown', handleKeyPress, true);
    };
  }, [isSequenceEditInRNABuilderMode]);

  return ketcherEditorRootElement && !isSequenceEditInRNABuilderMode
    ? createPortal(
        <StyledMenu id={CONTEXT_MENU_ID.FOR_SEQUENCE}>
          {assembleMenuItems()}
        </StyledMenu>,
        ketcherEditorRootElement,
      )
    : null;
};
