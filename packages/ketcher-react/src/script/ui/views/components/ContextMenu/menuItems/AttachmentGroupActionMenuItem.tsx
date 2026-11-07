import { Tooltip } from '@mui/material';
import type { FC } from 'react';
import { Item } from 'react-contexify';
import useAttachmentGroupCreate, {
  ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP,
} from '../hooks/useAttachmentGroupCreate';
import type {
  AtomContextMenuProperties,
  MenuItemsProperties,
  SelectionContextMenuProperties,
} from '../contextMenu.types';
import styles from '../ContextMenu.module.less';
import AttachmentGroupMenuItems from './AttachmentGroupMenuItems';

type Properties = MenuItemsProperties<
  AtomContextMenuProperties | SelectionContextMenuProperties
> & {
  showCreate: boolean;
};

const AttachmentGroupActionMenuItem: FC<Properties> = ({
  showCreate,
  ...menuItemProperties
}) => {
  const {
    handler: handleAttachmentGroupCreate,
    isDisabled: attachmentGroupCreateDisabled,
  } = useAttachmentGroupCreate();

  if (menuItemProperties.propsFromTrigger?.attachmentGroupIds?.length) {
    return <AttachmentGroupMenuItems {...menuItemProperties} />;
  }

  if (!showCreate) {
    return null;
  }

  const isAttachmentGroupCreateDisabled = attachmentGroupCreateDisabled();

  return (
    <Item
      {...menuItemProperties}
      data-testid="Create Attachment Group-option"
      onClick={handleAttachmentGroupCreate}
      disabled={isAttachmentGroupCreateDisabled}
    >
      <Tooltip
        title={
          isAttachmentGroupCreateDisabled
            ? ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP
            : ''
        }
        placement="right"
        slotProps={{
          tooltip: {
            sx: { backgroundColor: '#333333' },
          },
        }}
      >
        <span className={styles.tooltipTarget}>Create attachment group</span>
      </Tooltip>
    </Item>
  );
};

export default AttachmentGroupActionMenuItem;
