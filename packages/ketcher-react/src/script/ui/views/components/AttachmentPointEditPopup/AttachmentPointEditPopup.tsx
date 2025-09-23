import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { AttachmentPointClickData, AttachmentPointName } from 'ketcher-core';
import AttachmentPointControls from '../MonomerCreationWizard/components/AttachmentPointControls/AttachmentPointControls';
import { useAttachmentPointSelectsData } from '../MonomerCreationWizard/hooks/useAttachmentPointSelectsData';

import styles from './AttachmentPointEditPopup.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Editor } from '../../../../editor';
import assert from 'assert';

type Props = {
  data: AttachmentPointClickData;
  onNameChange: (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => void;
  onLeavingAtomChange: (
    apName: AttachmentPointName,
    newLeavingAtomId: number,
  ) => void;
  onClose: VoidFunction;
  editor: Editor;
};

const AttachmentPointEditPopup = ({
  data,
  onNameChange,
  onLeavingAtomChange,
  onClose,
  editor,
}: Props) => {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = popupRef.current;
      const target = event.target as Node;

      if (!popup || popup.contains(target)) {
        return;
      }

      // Check if the click is on a MUI Select dropdown or its options
      // MUI Select typically uses classes like 'MuiPaper-root', 'MuiList-root', 'MuiMenuItem-root'
      const clickedElement = event.target as Element;

      // Check if click is on MUI Select dropdown elements
      if (
        clickedElement.closest &&
        (clickedElement.closest('[role="listbox"]') ||
          clickedElement.closest('[role="option"]') ||
          clickedElement.closest('.MuiPaper-root') ||
          clickedElement.closest('.MuiList-root') ||
          clickedElement.closest('.MuiMenuItem-root') ||
          clickedElement.closest('.MuiSelect-root') ||
          clickedElement.closest('[data-testid*="select"]'))
      ) {
        return;
      }

      onClose();
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);

  const { attachmentPointName, position } = data;

  assert(editor.monomerCreationState);

  const { assignedAttachmentPoints } = editor.monomerCreationState;

  const selectData = useAttachmentPointSelectsData(editor, attachmentPointName);

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== attachmentPointName) {
      onNameChange(attachmentPointName, newName);
    }
    onClose();
  };

  const handleLeavingAtomChange = (newLeavingAtomId: number) => {
    const currentAtomPair = assignedAttachmentPoints.get(attachmentPointName);

    assert(currentAtomPair);

    const currentLeavingAtomId = currentAtomPair[1];

    if (newLeavingAtomId !== currentLeavingAtomId) {
      onLeavingAtomChange(attachmentPointName, newLeavingAtomId);
    }
    onClose();
  };

  return (
    <div
      className={clsx(selectStyles.selectContainer, styles.popup)}
      style={{ top: position.y, left: position.x }}
      ref={popupRef}
    >
      <p className={styles.title}>Edit connection point</p>
      <AttachmentPointControls
        data={selectData}
        onNameChange={handleNameChange}
        onLeavingAtomChange={handleLeavingAtomChange}
        className={styles.selectsWrapper}
      />
    </div>
  );
};

export default AttachmentPointEditPopup;
