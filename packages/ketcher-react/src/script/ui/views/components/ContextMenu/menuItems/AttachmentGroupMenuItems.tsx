import type { FC } from 'react';
import { Item } from 'react-contexify';
import styles from '../ContextMenu.module.less';
import useAttachmentGroupDelete from '../hooks/useAttachmentGroupDelete';
import type {
  AttachmentGroupContextMenuProperties,
  AtomContextMenuProperties,
  MenuItemsProperties,
  SelectionContextMenuProperties,
} from '../contextMenu.types';

const AttachmentGroupMenuItems: FC<
  MenuItemsProperties<
    | AttachmentGroupContextMenuProperties
    | AtomContextMenuProperties
    | SelectionContextMenuProperties
  >
> = (properties) => {
  const handleDelete = useAttachmentGroupDelete();

  return (
    <Item
      {...properties}
      data-testid="Remove Attachment Group-option"
      onClick={handleDelete}
    >
      <span className={styles.contextMenuText}>Remove attachment group</span>
    </Item>
  );
};

export default AttachmentGroupMenuItems;
