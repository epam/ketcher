import { Tooltip } from '@mui/material';
import type { FC } from 'react';
import { Item } from 'react-contexify';
import { useTranslation } from 'react-i18next';
import useAttachmentGroupCreate, {
  ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP_KEY,
} from '../hooks/useAttachmentGroupCreate';
import type {
  AtomContextMenuProps,
  MenuItemsProps,
  SelectionContextMenuProps,
} from '../contextMenu.types';
import styles from '../ContextMenu.module.less';
import AttachmentGroupMenuItems from './AttachmentGroupMenuItems';

type Props = MenuItemsProps<
  AtomContextMenuProps | SelectionContextMenuProps
> & {
  showCreate: boolean;
};

const AttachmentGroupActionMenuItem: FC<Props> = ({
  showCreate,
  ...menuItemProps
}) => {
  const { t } = useTranslation('components');
  const {
    handler: handleAttachmentGroupCreate,
    isDisabled: attachmentGroupCreateDisabled,
  } = useAttachmentGroupCreate();

  if (menuItemProps.propsFromTrigger?.attachmentGroupIds?.length) {
    return <AttachmentGroupMenuItems {...menuItemProps} />;
  }

  if (!showCreate) {
    return null;
  }

  const isAttachmentGroupCreateDisabled = attachmentGroupCreateDisabled();

  return (
    <Item
      {...menuItemProps}
      data-testid="Create Attachment Group-option"
      onClick={handleAttachmentGroupCreate}
      disabled={isAttachmentGroupCreateDisabled}
    >
      <Tooltip
        title={
          isAttachmentGroupCreateDisabled
            ? t(ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP_KEY)
            : ''
        }
        placement="right"
        slotProps={{
          tooltip: {
            sx: { backgroundColor: '#333333' },
          },
        }}
      >
        <span className={styles.tooltipTarget}>
          {t('rgroup.createAttachmentGroup')}
        </span>
      </Tooltip>
    </Item>
  );
};

export default AttachmentGroupActionMenuItem;
