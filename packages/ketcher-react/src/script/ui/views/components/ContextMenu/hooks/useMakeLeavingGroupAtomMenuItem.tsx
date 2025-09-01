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

  const { assignedAttachmentPoints } = editor.monomerCreationState;

  const attachmentPointsLimitReached = assignedAttachmentPoints.size >= 8;

  const attachmentPointIsAssigned = Array.from(
    assignedAttachmentPoints.values(),
  ).includes(selectedAtomId);

  const isMakeLeavingGroupAtomDisabled = attachmentPointsLimitReached;

  const handleMakeLeavingGroupAtomClick = () => {
    assert(selectedAtomId !== undefined);

    editor.assignLeavingGroupAtom(selectedAtomId);
  };

  return attachmentPointIsAssigned ? (
    <>
      <Item>
        <Icon name="editMenu" className={styles.icon} />
        Edit connection point
      </Item>
      <Item>
        <Icon name="deleteMenu" className={styles.icon} />
        Remove assignment
      </Item>
    </>
  ) : (
    <Item
      {...props}
      data-testid="Assign as leaving group"
      onClick={handleMakeLeavingGroupAtomClick}
      disabled={isMakeLeavingGroupAtomDisabled}
    >
      Assign as leaving group
    </Item>
  );
};

export default useMakeLeavingGroupAtomMenuItem;
