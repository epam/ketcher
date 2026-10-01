import type { FC } from 'react';
import { Item } from 'react-contexify';
import styles from '../ContextMenu.module.less';
import useAttachmentGroupDelete from '../hooks/useAttachmentGroupDelete';
import type {
  AttachmentGroupContextMenuProps,
  AtomContextMenuProps,
  MenuItemsProps,
  SelectionContextMenuProps,
} from '../contextMenu.types';

const AttachmentGroupMenuItems: FC<
  MenuItemsProps<
    | AttachmentGroupContextMenuProps
    | AtomContextMenuProps
    | SelectionContextMenuProps
  >
> = (props) => {
  const handleDelete = useAttachmentGroupDelete();

  return (
    <Item
      {...props}
      data-testid="Remove Attachment Group-option"
      onClick={handleDelete}
    >
      <span className={styles.contextMenuText}>Remove attachment group</span>
    </Item>
  );
};

export default AttachmentGroupMenuItems;
