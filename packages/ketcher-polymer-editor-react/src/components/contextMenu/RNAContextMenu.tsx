import {
  Item,
  ItemParams,
  Menu,
  PredicateParams,
  Separator,
} from 'react-contexify';
import { openModal } from 'state/modal';
import { useAppDispatch } from 'hooks';
import { ReactElement } from 'react';
import { CONTEXT_MENU_ID } from './types';
import { setActivePreset } from 'state/rna-builder';

export const RNAContextMenu = () => {
  const dispatch = useAppDispatch();
  const RNAMenus = [
    { name: 'duplicateandedit', title: 'Duplicate and Edit' },
    { name: 'edit', title: 'Edit', seperator: true },
    { name: 'deletepreset', title: 'Delete Preset' },
  ];

  const isItemDisabled = (name: string) => {
    return ({ props }: PredicateParams) => {
      if (name === 'deletepreset' && props.preset?.default) {
        return true;
      }
      return false;
    };
  };

  const handleMenuChange = ({ id, props }: ItemParams) => {
    switch (id) {
      case 'duplicateandedit':
        props.duplicatePreset(props.preset);
        break;
      case 'edit':
        props.activateEditMode();
        break;
      case 'deletepreset':
        dispatch(setActivePreset(props.preset));
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

  return <Menu id={CONTEXT_MENU_ID.FOR_RNA}>{assembleMenuItems()}</Menu>;
};
