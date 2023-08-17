import { FC } from 'react';
import { Item } from 'react-contexify';
import useAtomEdit from '../hooks/useAtomEdit';
import useAtomStereo from '../hooks/useAtomStereo';
import useDelete from '../hooks/useDelete';
import { MenuItemsProps } from '../contextMenu.types';
import useRGroupAttachmentPointEdit from '../hooks/useRGroupAttachmentPointEdit';

const AtomMenuItems: FC<MenuItemsProps> = (props) => {
  const [handleEdit] = useAtomEdit();
  const [handleStereo, stereoDisabled] = useAtomStereo();
  const [
    handleEditRGroupAttachmentPoint,
    rgroupAttachmentPointDisabled,
    rgroupAttachmentPointHidden,
  ] = useRGroupAttachmentPointEdit();
  const handleDelete = useDelete();

  return (
    <>
      <Item {...props} onClick={handleEdit}>
        {props.propsFromTrigger?.extraItemsSelected
          ? 'Edit selected atoms...'
          : 'Edit...'}
      </Item>

      <Item {...props} disabled={stereoDisabled} onClick={handleStereo}>
        Enhanced stereochemistry...
      </Item>

      <Item
        {...props}
        disabled={rgroupAttachmentPointDisabled}
        hidden={rgroupAttachmentPointHidden}
        onClick={handleEditRGroupAttachmentPoint}
      >
        Edit R-Group attachment point...
      </Item>

      <Item {...props} onClick={handleDelete}>
        Delete
      </Item>
    </>
  );
};

export default AtomMenuItems;
