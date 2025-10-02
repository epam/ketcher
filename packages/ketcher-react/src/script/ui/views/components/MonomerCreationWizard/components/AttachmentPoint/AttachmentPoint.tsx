import { AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import Editor from '../../../../../../editor';
import { Icon } from '../../../../../../../components';
import { useEffect, useRef, useState } from 'react';

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
  }, [editor, name]);

  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const handleAttachmentPointHighlight = (event: Event) => {
      const attachmentPointName = (event as CustomEvent<AttachmentPointName>)
        .detail;
      setHighlight(attachmentPointName === name);
    };
    const handleResetAttachmentPointHighlight = (event: Event) => {
      const attachmentPointName = (event as CustomEvent<AttachmentPointName>)
        .detail;
      if (attachmentPointName === name) {
        setHighlight(false);
      }
    };

    window.addEventListener(
      'highlightAttachmentPointControls',
      handleAttachmentPointHighlight,
    );
    window.addEventListener(
      'resetHighlightAttachmentPointControls',
      handleResetAttachmentPointHighlight,
    );

    return () => {
      window.removeEventListener(
        'highlightAttachmentPointControls',
        handleAttachmentPointHighlight,
      );
      window.removeEventListener(
        'resetHighlightAttachmentPointControls',
        handleResetAttachmentPointHighlight,
      );
    };
  }, [name]);

  const selectsData = useAttachmentPointSelectsData(editor, name);

  if (!selectsData) {
    return null;
  }

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
      data={selectsData}
      onNameChange={handleNameChange}
      onLeavingAtomChange={handleLeavingAtomChange}
      className={styles.selects}
      highlight={highlight}
      additionalControls={
        <button
          className={styles.removeButton}
          onClick={handleRemove}
          aria-label="Remove attachment point"
          data-testid={`remove-attachment-point-${name}`}
        >
          <Icon name="deleteMenu" />
        </button>
      }
      ref={attachmentPointsContainerRef}
    />
  );
};

export default AttachmentPoint;
