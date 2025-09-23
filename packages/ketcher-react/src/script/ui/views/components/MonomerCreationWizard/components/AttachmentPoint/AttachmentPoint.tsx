import { AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import Editor from '../../../../../../editor';
import { Icon } from '../../../../../../../components';
import { useEffect, useRef } from 'react';

type Props = {
  name: AttachmentPointName;
  editor: Editor;
  onNameChange: (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => void;
  onLeavingAtomChange: (
    apName: AttachmentPointName,
    newLeavingAtomId: number,
  ) => void;
  onRemove: (name: AttachmentPointName) => void;
};

const AttachmentPoint = ({
  name,
  editor,
  onNameChange,
  onLeavingAtomChange,
  onRemove,
}: Props) => {
  const attachmentPointsContainerRef = useRef<HTMLDivElement>(null);
  const selectData = useAttachmentPointSelectsData(editor, name);

  useEffect(() => {
    const element = attachmentPointsContainerRef.current;
    if (!element) {
      return;
    }

    const mouseOverHandler = () => {
      editor.highlightAttachmentPoint(name);
    };

    const mouseLeaveHandler = () => {
      editor.highlightAttachmentPoint(null);
    };

    element.addEventListener('mouseover', mouseOverHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      element.removeEventListener('mouseover', mouseOverHandler);
      element.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, []);

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== name) {
      onNameChange(name, newName);
    }
  };

  const handleLeavingAtomChange = (newLeavingAtomId: number) => {
    onLeavingAtomChange(name, newLeavingAtomId);
  };

  const handleRemove = () => {
    onRemove(name);
  };

  return (
    <AttachmentPointControls
      data={selectData}
      onNameChange={handleNameChange}
      onLeavingAtomChange={handleLeavingAtomChange}
      className={styles.selects}
      additionalControls={
        <button
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="Remove attachment point"
        >
          <Icon name="deleteMenu" />
        </button>
      }
      ref={attachmentPointsContainerRef}
    />
  );
};

export default AttachmentPoint;
