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

  const { attachmentPointName } = propsFromTrigger;

  const handleEditClick = () => {
    const atomPair =
      editor.monomerCreationState?.assignedAttachmentPoints?.get(
        attachmentPointName,
      );

    assert(atomPair);

    const [, leavingAtomId] = atomPair;
    const atom = editor.struct().atoms.get(leavingAtomId);
    assert(atom);

    const attachmentPointEditData: AttachmentPointClickData = {
      atomId: leavingAtomId,
      atomLabel: atom.label,
      attachmentPointName,
      position: Coordinates.modelToView(atom.pp),
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
    editor.removeAttachmentPoint(attachmentPointName);
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
