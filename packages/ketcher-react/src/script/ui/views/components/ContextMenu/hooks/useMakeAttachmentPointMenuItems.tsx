import { AtomContextMenuProps, MenuItemsProps } from '../contextMenu.types';
import { Editor } from 'src/script/editor';
import assert from 'assert';
import { Item } from 'react-contexify';
import { Icon } from '../../../../../../components';
import styles from '../ContextMenu.module.less';
import { ReactNode } from 'react';

type Props = {
  props: MenuItemsProps<AtomContextMenuProps>;
  selectedAtomId: number | undefined;
  editor: Editor;
};

const useMakeAttachmentPointMenuItems = ({
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

  const implicitHydrogen = editor.struct().atoms.get(selectedAtomId)?.implicitH;

  const isPotentialLeavingGroupAtom = Array.from(
    potentialAttachmentPoints.values(),
  ).some((leavingAtomIds) => leavingAtomIds.has(selectedAtomId));
  const isPotentialAttachmentAtom =
    potentialAttachmentPoints.has(selectedAtomId) ||
    (implicitHydrogen !== undefined && implicitHydrogen > 0);

  const attachmentPointsLimitReached = assignedAttachmentPoints.size >= 8;

  const menuItems: ReactNode[] = [];

  if (isPotentialLeavingGroupAtom) {
    const handleMarkLeavingGroupAtomClick = () => {
      assert(selectedAtomId !== undefined);

      editor.assignLeavingGroupAtom(selectedAtomId);
    };

    menuItems.push(
      <Item
        {...props}
        onClick={handleMarkLeavingGroupAtomClick}
        disabled={attachmentPointsLimitReached}
        key="mark-as-leaving-group"
        data-testid="mark-as-leaving-group"
      >
        <Icon name="leavingGroup" className={styles.icon} />
        Mark as leaving group
      </Item>,
    );
  }

  if (isPotentialAttachmentAtom) {
    const handleMarkConnectionPointAtomClick = () => {
      assert(selectedAtomId !== undefined);

      editor.assignConnectionPointAtom(selectedAtomId);
    };

    menuItems.push(
      <Item
        {...props}
        onClick={handleMarkConnectionPointAtomClick}
        disabled={attachmentPointsLimitReached}
        data-testid="mark-as-connection-point"
        key="mark-as-connection-point"
      >
        <Icon name="connectionPoint" className={styles.icon} />
        Mark as connection point
      </Item>,
    );
  }

  return menuItems.length > 0 ? menuItems : null;
};

export default useMakeAttachmentPointMenuItems;
