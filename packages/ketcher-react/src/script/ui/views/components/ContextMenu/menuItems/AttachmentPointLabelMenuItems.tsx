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
  Vec2,
} from 'ketcher-core';
import Editor from '../../../../../editor';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from 'src/constants';

const AttachmentPointLabelMenuItems = ({
  propsFromTrigger,
  triggerEvent,
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

    if (!atomPair) {
      return;
    }

    const [, leavingAtomId] = atomPair;
    const leavingAtom = editor.struct().atoms.get(leavingAtomId);
    if (!leavingAtom) {
      return;
    }

    const positionFromClick = (() => {
      const event = triggerEvent?.event;
      if (!event || typeof (event as MouseEvent).clientX !== 'number') {
        return null;
      }
      const rootElement = document.querySelector(
        KETCHER_ROOT_NODE_CSS_SELECTOR,
      );
      if (!rootElement) {
        return null;
      }
      const { left, top } = rootElement.getBoundingClientRect();
      return new Vec2(
        (event as MouseEvent).clientX - left,
        (event as MouseEvent).clientY - top,
      );
    })();

    const attachmentPointEditData: AttachmentPointClickData = {
      attachmentPointName,
      position: positionFromClick ?? Coordinates.modelToView(leavingAtom.pp),
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
