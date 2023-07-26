import { FC } from 'react';
import { Item } from 'react-contexify';
import { MenuItemsProps } from '../contextMenu.types';
import useRGroupAttachmentPointRemove from '../hooks/useRGroupAttachmentPointRemove';

const RGroupAttachmentPointMenuItems: FC<MenuItemsProps> = (props) => {
  const handleRemove = useRGroupAttachmentPointRemove();

  return (
    <>
      <Item {...props} onClick={handleRemove}>
        Remove
      </Item>
    </>
  );
};

export default RGroupAttachmentPointMenuItems;
