import type { FC } from 'react';
import { Item } from 'react-contexify';
import { Icon } from 'components';
import styles from '../ContextMenu.module.less';
import useAttachmentGroupDelete from '../hooks/useAttachmentGroupDelete';
import type {
  AttachmentGroupContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';

const AttachmentGroupMenuItems: FC<
  MenuItemsProps<AttachmentGroupContextMenuProps>
> = (props) => {
  const handleDelete = useAttachmentGroupDelete();

  return (
    <Item
      {...props}
      data-testid="Delete Attachment Group-option"
      onClick={handleDelete}
    >
      <Icon name="deleteMenu" className={styles.icon} />
      <span className={styles.contextMenuText}>Delete attachment group</span>
    </Item>
  );
};

export default AttachmentGroupMenuItems;
