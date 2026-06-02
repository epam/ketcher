import type { AtomLabel, AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

import { useAttachmentPointSelectsData } from '../../hooks/useAttachmentPointSelectsData';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import type Editor from '../../../../../../editor';
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
    newLeavingAtomLabel: AtomLabel,
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
    // The same AP is represented on canvas by several elements (the R-label,
    // the attachment atom, the leaving-group atom, and the bond between them),
    // each dispatching its own enter/leave events. Moving the cursor between
    // two of them can deliver a stale "reset" right after a fresh "highlight",
    // which would wrongly clear the row. Counting active hovers keeps the row
    // highlighted until the cursor has truly left every element of this AP.
    let hoverCount = 0;

    const handleAttachmentPointHighlight = (event: Event) => {
      const attachmentPointName = (event as CustomEvent<AttachmentPointName>)
        .detail;
      if (attachmentPointName === name) {
        hoverCount += 1;
        setHighlight(true);
      } else {
        // Only one AP is hovered at a time, so another AP's highlight means
        // this row is no longer hovered (also recovers any unbalanced count).
        hoverCount = 0;
        setHighlight(false);
      }
    };
    const handleResetAttachmentPointHighlight = (event: Event) => {
      const attachmentPointName = (event as CustomEvent<AttachmentPointName>)
        .detail;
      if (attachmentPointName === name) {
        hoverCount = Math.max(0, hoverCount - 1);
        if (hoverCount === 0) {
          setHighlight(false);
        }
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
