import { Item, ItemParams, Separator } from 'react-contexify';
import { openModal } from 'state/modal';
import { useAppDispatch, useAppSelector } from 'hooks';
import { ReactElement } from 'react';
import { CONTEXT_MENU_ID } from './types';
import { selectCurrentTabIndex, setSelectedTabIndex } from 'state/library';
import { selectActivePresetForContextMenu } from 'state/rna-builder';
import { StyledMenu } from './styles';

export const RNAContextMenu = () => {
  const RNA_TAB_INDEX = 2;
  const dispatch = useAppDispatch();
  const activePresetForContextMenu = useAppSelector(
    selectActivePresetForContextMenu,
  );
  const selectedTabIndex = useAppSelector(selectCurrentTabIndex);
  const RNAMenus = [
    { name: 'duplicateandedit', title: 'Duplicate and Edit...' },
    { name: 'edit', title: 'Edit...', seperator: true },
    { name: 'deletepreset', title: 'Delete Preset' },
  ];

  const isItemDisabled = (name: string) => {
    if (
      ['deletepreset', 'edit'].includes(name) &&
      activePresetForContextMenu?.default
    ) {
      return true;
    }
    return false;
  };

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

  const assembleMenuItems = () => {
    const items: ReactElement[] = [];
    RNAMenus.forEach(({ name, title, seperator }, index) => {
      const item = (
        <Item
          id={name}
          onClick={handleMenuChange}
          key={name}
          disabled={isItemDisabled(name)}
          data-testid={name}
        >
          <span>{title}</span>
        </Item>
      );
      items.push(item);
      if (seperator) {
        items.push(<Separator key={index} />);
      }
    });
    return items;
  };

  return (
    <StyledMenu id={CONTEXT_MENU_ID.FOR_RNA}>{assembleMenuItems()}</StyledMenu>
  );
};
