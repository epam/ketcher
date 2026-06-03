import type {
  AtomLabel,
  AttachmentPointId,
  AttachmentPointName,
} from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import type Editor from '../../../../../../editor';
import { Icon } from '../../../../../../../components';
import { useEffect, useRef, useState } from 'react';

type Props = {
  id: AttachmentPointId;
  name: AttachmentPointName;
  editor: Editor;
  onNameChange: (
    attachmentPointId: AttachmentPointId,
    newName: AttachmentPointName,
  ) => void;
  onLeavingAtomChange: (
    attachmentPointId: AttachmentPointId,
    newLeavingAtomLabel: AtomLabel,
  ) => void;
  onRemove: (attachmentPointId: AttachmentPointId) => void;
};

const AttachmentPoint = ({
  id,
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
      editor.highlightAttachmentPoint(id);
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
  }, [editor, id]);

  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const handleAttachmentPointHighlight = (event: Event) => {
      const attachmentPointId = (event as CustomEvent<AttachmentPointId>)
        .detail;
      setHighlight(attachmentPointId === id);
    };
    const handleResetAttachmentPointHighlight = (event: Event) => {
      const attachmentPointId = (event as CustomEvent<AttachmentPointId>)
        .detail;
      if (attachmentPointId === id) {
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
  }, [id]);

  const selectsData = useAttachmentPointSelectsData(editor, id);

  if (!selectsData) {
    return null;
  }

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== name) {
      onNameChange(id, newName);
    }
  };

  const handleLeavingAtomChange = (newLeavingAtomLabel: AtomLabel) => {
    onLeavingAtomChange(id, newLeavingAtomLabel);
  };

  const handleRemove = () => {
    onRemove(id);
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
