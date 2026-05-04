import {
  AttachmentPointLabelContextMenuProps,
  MenuItemsProps,
} from '../contextMenu.types';
import { Item } from 'react-contexify';
import { Icon } from '../../../../../../components';
import styles from '../ContextMenu.module.less';
import { useAppContext } from '../../../../../../hooks';
import {
  AttachmentPointClickData,
  Coordinates,
  ketcherProvider,
  MonomerCreationAttachmentPointClickEvent,
} from 'ketcher-core';
import Editor from '../../../../../editor';
import assert from 'assert';

const AttachmentPointLabelMenuItems = ({
  propsFromTrigger,
}: MenuItemsProps<AttachmentPointLabelContextMenuProps>) => {
  const { ketcherId } = useAppContext();
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const editor = ketcher.editor as Editor;

  if (!propsFromTrigger) {
    return null;
  }

  const { attachmentAtomId, attachmentPointName } = propsFromTrigger;

  const handleEditClick = () => {
    const apEntry =
      editor.monomerCreationState?.assignedAttachmentPoints?.get(
        attachmentAtomId,
      );

    assert(apEntry);

    const { leavingAtomId } = apEntry;
    const leavingAtom = editor.struct().atoms.get(leavingAtomId);
    assert(leavingAtom);

    const attachmentPointEditData: AttachmentPointClickData = {
      attachmentAtomId,
      attachmentPointName,
      position: Coordinates.modelToView(leavingAtom.pp),
    };

    window.dispatchEvent(
      new CustomEvent<AttachmentPointClickData>(
        MonomerCreationAttachmentPointClickEvent,
        {
          detail: attachmentPointEditData,
        },
      ),
    );
  };

  const handleRemoveClick = () => {
    editor.removeAttachmentPoint(attachmentAtomId);
  };

  return (
    <>
      <Item data-testid="edit-connection-point" onClick={handleEditClick}>
        <Icon name="editMenu" className={styles.icon} />
        Edit connection point
      </Item>
      <Item data-testid="remove-assignment" onClick={handleRemoveClick}>
        <Icon name="deleteMenu" className={styles.icon} />
        Remove assignment
      </Item>
    </>
  );
};

export default AttachmentPointLabelMenuItems;
