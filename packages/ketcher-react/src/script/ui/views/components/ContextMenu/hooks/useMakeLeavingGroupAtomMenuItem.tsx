import { AtomContextMenuProps, MenuItemsProps } from '../contextMenu.types';
import { Editor } from 'src/script/editor';
import assert from 'assert';
import { Item } from 'react-contexify';

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

  const attachmentPointsLimitReached = assignedAttachmentPoints.size >= 8;

  const isMakeLeavingGroupAtomVisible =
    selectedAtomInMonomerCreationWizard &&
    Array.from(potentialAttachmentPoints.values()).includes(selectedAtomId);

  const isMakeLeavingGroupAtomDisabled =
    selectedAtomInMonomerCreationWizard &&
    (attachmentPointsLimitReached ||
      Array.from(assignedAttachmentPoints.values()).includes(selectedAtomId));

  const handleMakeLeavingGroupAtomClick = () => {
    assert(selectedAtomId !== undefined);

    editor.assignLeavingGroupAtom(selectedAtomId);
  };

  return isMakeLeavingGroupAtomVisible ? (
    <Item
      {...props}
      data-testid="Make a leaving group atom"
      onClick={handleMakeLeavingGroupAtomClick}
      disabled={isMakeLeavingGroupAtomDisabled}
    >
      Make a leaving group atom
    </Item>
  ) : null;
};

export default useMakeLeavingGroupAtomMenuItem;
