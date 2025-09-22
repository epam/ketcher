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

  const isAtomInAssignedAttachmentPoint = Array.from(
    assignedAttachmentPoints.values(),
  ).some((atomPair) => {
    const [attachmentAtomId, leavingAtomId] = atomPair;
    return (
      selectedAtomId === attachmentAtomId || selectedAtomId === leavingAtomId
    );
  });

  if (isAtomInAssignedAttachmentPoint) {
    return null;
  }

  // const isAtomPotentialAttachmentPoint = Array.from(
  //   potentialAttachmentPoints.values(),
  // ).includes(selectedAtomId);
  const implicitHydrogen = editor.struct().atoms.get(selectedAtomId)?.implicitH;

  const isPotentialLeavingGroupAtom = Array.from(
    potentialAttachmentPoints.values(),
  ).some((leavingAtomIds) => leavingAtomIds.has(selectedAtomId));
  const isPotentialAttachmentAtom =
    potentialAttachmentPoints.has(selectedAtomId) ||
    (implicitHydrogen !== undefined && implicitHydrogen > 0);

  // const attachmentPointName = Array.from(assignedAttachmentPoints.keys()).find(
  //   (key) => {
  //     const atomsPair = assignedAttachmentPoints.get(key);
  //     assert(atomsPair);
  //     return atomsPair[1] === selectedAtomId;
  //   },
  // );
  //
  // const isAtomAssignedAttachmentPoint = Boolean(attachmentPointName);

  // if (!isPotentialAttachmentAtom && !isPotentialLeavingGroupAtom) {
  //   return null;
  // }

  // const handleEditClick = () => {
  //   const atom = editor.struct().atoms.get(selectedAtomId);
  //
  //   assert(atom);
  //   assert(attachmentPointName);
  //
  //   const attachmentPointEditData: AttachmentPointClickData = {
  //     atomId: selectedAtomId,
  //     atomLabel: atom.label,
  //     attachmentPointName,
  //     position: Coordinates.modelToView(atom.pp),
  //   };
  //
  //   window.dispatchEvent(
  //     new CustomEvent<AttachmentPointClickData>(
  //       MonomerCreationAttachmentPointClickEvent,
  //       {
  //         detail: attachmentPointEditData,
  //       },
  //     ),
  //   );
  // };

  // const handleRemoveClick = () => {
  //   assert(attachmentPointName);
  //
  //   editor.removeAttachmentPoint(attachmentPointName);
  // };

  const attachmentPointsLimitReached = assignedAttachmentPoints.size >= 8;

  if (isPotentialLeavingGroupAtom) {
    const handleMarkLeavingGroupAtomClick = () => {
      assert(selectedAtomId !== undefined);

      editor.assignLeavingGroupAtom(selectedAtomId);
    };

    return (
      <Item
        {...props}
        data-testid="mark-as-leaving-group"
        onClick={handleMarkLeavingGroupAtomClick}
        disabled={attachmentPointsLimitReached}
      >
        <Icon name="leavingGroup" className={styles.icon} />
        Mark as leaving group
      </Item>
    );
  }

  if (isPotentialAttachmentAtom) {
    const handleMarkConnectionPointAtomClick = () => {
      assert(selectedAtomId !== undefined);

      editor.assignConnectionPointAtom(selectedAtomId);
    };

    return (
      <Item
        {...props}
        data-testid="mark-as-connection-point"
        onClick={handleMarkConnectionPointAtomClick}
        disabled={attachmentPointsLimitReached}
      >
        <Icon name="connectionPoint" className={styles.icon} />
        Mark as connection point
      </Item>
    );
  }

  return null;

  // return isAtomAssignedAttachmentPoint ? (
  //   <>
  //     <Item data-testid="edit-connection-point" onClick={handleEditClick}>
  //       <Icon name="editMenu" className={styles.icon} />
  //       Edit connection point
  //     </Item>
  //     <Item data-testid="remove-assignment" onClick={handleRemoveClick}>
  //       <Icon name="deleteMenu" className={styles.icon} />
  //       Remove assignment
  //     </Item>
  //   </>
  // ) :
};

export default useMakeLeavingGroupAtomMenuItem;
