import { FC } from 'react';
import { Item } from 'react-contexify';
import {
  MenuItemsProps,
  RGroupAttachmentPointContextMenuProps,
} from '../contextMenu.types';
import useRGroupAttachmentPointRemove from '../hooks/useRGroupAttachmentPointRemove';
import useRGroupAttachmentPointEdit from '../hooks/useRGroupAttachmentPointEdit';

const RGroupAttachmentPointMenuItems: FC<
  MenuItemsProps<RGroupAttachmentPointContextMenuProps>
> = (props) => {
  const handleRemove = useRGroupAttachmentPointRemove();
  const [
    handleEditRGroupAttachmentPoint,
    rgroupAttachmentPointDisabled,
    rgroupAttachmentPointHidden,
  ] = useRGroupAttachmentPointEdit();

  return (
    <>
      <Item
        {...props}
        disabled={rgroupAttachmentPointDisabled}
        hidden={rgroupAttachmentPointHidden}
        onClick={handleEditRGroupAttachmentPoint}
      >
        Edit...
      </Item>
      <Item {...props} onClick={handleRemove}>
        Remove
      </Item>
    </>
  );
};

export default RGroupAttachmentPointMenuItems;
