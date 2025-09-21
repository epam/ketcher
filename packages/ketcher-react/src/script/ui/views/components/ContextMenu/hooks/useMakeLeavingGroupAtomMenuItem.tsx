import {
  AttachmentPointClickData,
  Coordinates,
  MonomerCreationAttachmentPointClickEvent,
} from 'ketcher-core';
import { AtomContextMenuProps, MenuItemsProps } from '../contextMenu.types';
import { Editor } from 'src/script/editor';
import assert from 'assert';
import { Item } from 'react-contexify';
import { Icon } from '../../../../../../components';
import styles from '../ContextMenu.module.less';

type Props = {
  props: MenuItemsProps<AtomContextMenuProps>;
  selectedAtomId: number | undefined;
  editor: Editor;
};

const useMakeLeavingGroupAtomMenuItem = ({
  props,
  selectedAtomId,
  editor,
}: Props) => {
  const selectedAtomInMonomerCreationWizard =
    selectedAtomId !== undefined && editor.isMonomerCreationWizardActive;

  if (!selectedAtomInMonomerCreationWizard) {
    return null;
  }

  assert(editor.monomerCreationState);

  const { assignedAttachmentPoints, potentialAttachmentPoints } =
    editor.monomerCreationState;

  const isAtomPotentialAttachmentPoint = Array.from(
    potentialAttachmentPoints.values(),
  ).includes(selectedAtomId);

  const attachmentPointName = Array.from(assignedAttachmentPoints.keys()).find(
    (key) => {
      const atomsPair = assignedAttachmentPoints.get(key);
      assert(atomsPair);
      return atomsPair[1] === selectedAtomId;
    },
  );

  const isAtomAssignedAttachmentPoint = Boolean(attachmentPointName);

  if (!isAtomPotentialAttachmentPoint && !isAtomAssignedAttachmentPoint) {
    return null;
  }

  const attachmentPointsLimitReached = assignedAttachmentPoints.size >= 8;

  const handleMakeLeavingGroupAtomClick = () => {
    assert(selectedAtomId !== undefined);

    editor.assignLeavingGroupAtom(selectedAtomId);
  };

  const handleEditClick = () => {
    const atom = editor.struct().atoms.get(selectedAtomId);

    assert(atom);
    assert(attachmentPointName);

    const attachmentPointEditData: AttachmentPointClickData = {
      atomId: selectedAtomId,
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
    assert(attachmentPointName);

    editor.removeAttachmentPoint(attachmentPointName);
  };

  return isAtomAssignedAttachmentPoint ? (
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
  ) : (
    <Item
      {...props}
      data-testid="assign-as-a-leaving-group"
      onClick={handleMakeLeavingGroupAtomClick}
      disabled={attachmentPointsLimitReached}
    >
      <Icon name="leavingGroup" className={styles.icon} />
      Assign as a leaving group
    </Item>
  );
};

export default useMakeLeavingGroupAtomMenuItem;
