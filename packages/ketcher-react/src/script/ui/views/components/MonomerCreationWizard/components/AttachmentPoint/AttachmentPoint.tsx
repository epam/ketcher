import type { AtomLabel, AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import type Editor from '../../../../../../editor';
import { Icon } from '../../../../../../../components';
import { useEffect, useRef, useState } from 'react';

type Props = {
  name: AttachmentPointName;
  displayName?: AttachmentPointName;
  editor: Editor;
  onNameChange: (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
    attachmentAtomId: number,
  ) => void;
  onLeavingAtomChange: (
    apName: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) => void;
  onRemove: (name: AttachmentPointName) => void;
  usedAttachmentPointNames?: AttachmentPointName[];
  invalid?: boolean;
};

const AttachmentPoint = ({
  name,
  displayName,
  editor,
  onNameChange,
  onLeavingAtomChange,
  onRemove,
  usedAttachmentPointNames,
  invalid,
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

  const selectsData = useAttachmentPointSelectsData(
    editor,
    name,
    displayName ?? name,
    usedAttachmentPointNames,
  );

  if (!selectsData) {
    return null;
  }

  const handleNameChange = (newName: AttachmentPointName) => {
    if (newName !== (displayName ?? name)) {
      onNameChange(name, newName, selectsData.attachmentAtomId);
    }
  };

  const handleLeavingAtomChange = (newLeavingAtomLabel: AtomLabel) => {
    onLeavingAtomChange(name, newLeavingAtomLabel);
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
      invalid={invalid}
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
