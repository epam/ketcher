import { AtomLabel, AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import Editor from '../../../../../../editor';
import { Icon } from '../../../../../../../components';
import { useEffect, useRef, useState } from 'react';

type Props = {
  attachmentAtomId: number;
  name: AttachmentPointName;
  editor: Editor;
  onNameChange: (
    attachmentAtomId: number,
    newName: AttachmentPointName,
  ) => void;
  onLeavingAtomChange: (
    attachmentAtomId: number,
    newLeavingAtomLabel: AtomLabel,
  ) => void;
  onRemove: (attachmentAtomId: number) => void;
};

const AttachmentPoint = ({
  attachmentAtomId,
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
      editor.highlightAttachmentPoint(attachmentAtomId);
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
  }, [attachmentAtomId, editor]);

  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const handleAttachmentPointHighlight = (event: Event) => {
      const highlightedAttachmentAtomId = (event as CustomEvent<number>).detail;
      setHighlight(highlightedAttachmentAtomId === attachmentAtomId);
    };
    const handleResetAttachmentPointHighlight = (event: Event) => {
      const highlightedAttachmentAtomId = (event as CustomEvent<number>).detail;
      if (highlightedAttachmentAtomId === attachmentAtomId) {
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
  }, [attachmentAtomId]);

  const selectsData = useAttachmentPointSelectsData(editor, attachmentAtomId);

  if (!selectsData) {
    return null;
  }

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== name) {
      onNameChange(attachmentAtomId, newName);
    }
  };

  const handleLeavingAtomChange = (newLeavingAtomLabel: AtomLabel) => {
    onLeavingAtomChange(attachmentAtomId, newLeavingAtomLabel);
  };

  const handleRemove = () => {
    onRemove(attachmentAtomId);
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
          data-testid={`attachment-point-delete-button-${name}`}
        >
          <Icon name="deleteMenu" />
        </button>
      }
      ref={attachmentPointsContainerRef}
    />
  );
};

export default AttachmentPoint;
