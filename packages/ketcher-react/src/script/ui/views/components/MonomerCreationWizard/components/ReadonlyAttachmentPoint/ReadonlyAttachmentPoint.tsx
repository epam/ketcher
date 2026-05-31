import { AttachmentPointName, AtomLabel } from 'ketcher-core';
import { useEffect, useRef, useState } from 'react';
import AttachmentPointControls from '../AttachmentPointControls/AttachmentPointControls';
import Editor from '../../../../../../editor';
import styles from '../AttachmentPoint/AttachmentPoint.module.less';
import { createReadonlyAttachmentPointSelectData } from '../../hooks/useAttachmentPointSelectsData';

type Props = {
  name: AttachmentPointName;
  leavingAtomLabel: AtomLabel;
  editor: Editor;
  /** When provided, hover highlights this specific atom instead of using the
   * name-keyed connection map. Use this when multiple components share the
   * same AP name (e.g. base R1 and phosphate R1). */
  atomId?: number;
  onLeavingAtomChange?: (
    apName: AttachmentPointName,
    newLeavingAtomLabel: AtomLabel,
  ) => void;
};

/**
 * Displays a readonly (inter-component connection) attachment point.
 * Hovering highlights the corresponding atom on canvas,
 * and hovering the atom on canvas highlights this row in the panel.
 */
const ReadonlyAttachmentPoint = ({
  name,
  leavingAtomLabel,
  editor,
  atomId,
  onLeavingAtomChange,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);
  // Track the currently selected leaving atom so the select reflects user changes.
  const [currentLeavingAtomLabel, setCurrentLeavingAtomLabel] =
    useState<AtomLabel>(leavingAtomLabel);

  // Reset when the default label changes (e.g. component re-assigned).
  useEffect(() => {
    setCurrentLeavingAtomLabel(leavingAtomLabel);
  }, [leavingAtomLabel]);

  // Panel hover → canvas highlight
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const mouseOverHandler = () => {
      if (atomId !== undefined) {
        // Use atom-specific highlighting to avoid AP name collisions between components.
        editor.highlightAtomById(atomId);
      } else {
        editor.highlightConnectionAttachmentPoint(name);
      }
    };
    const mouseLeaveHandler = () => {
      if (atomId !== undefined) {
        editor.highlightAtomById(null);
      } else {
        editor.highlightConnectionAttachmentPoint(null);
      }
    };

    element.addEventListener('mouseover', mouseOverHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      element.removeEventListener('mouseover', mouseOverHandler);
      element.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, [editor, name, atomId]);

  // Canvas hover → panel highlight
  useEffect(() => {
    const handleHighlight = (event: Event) => {
      const apName = (event as CustomEvent<AttachmentPointName>).detail;
      setHighlight(apName === name);
    };
    const handleReset = (event: Event) => {
      const apName = (event as CustomEvent<AttachmentPointName>).detail;
      if (apName === name) {
        setHighlight(false);
      }
    };

    window.addEventListener(
      'highlightAttachmentPointControls',
      handleHighlight,
    );
    window.addEventListener(
      'resetHighlightAttachmentPointControls',
      handleReset,
    );

    return () => {
      window.removeEventListener(
        'highlightAttachmentPointControls',
        handleHighlight,
      );
      window.removeEventListener(
        'resetHighlightAttachmentPointControls',
        handleReset,
      );
    };
  }, [name]);

  const selectsData = createReadonlyAttachmentPointSelectData(
    name,
    currentLeavingAtomLabel,
  );

  const handleLeavingAtomChange = (newLabel: AtomLabel) => {
    setCurrentLeavingAtomLabel(newLabel);
    onLeavingAtomChange?.(name, newLabel);
  };

  return (
    <AttachmentPointControls
      data={selectsData}
      onNameChange={() => null}
      onLeavingAtomChange={handleLeavingAtomChange}
      className={styles.selects}
      highlight={highlight}
      disabledName
      nameTooltip="Attachment point numbers of internal attachment points determined by the phosphate position switcher."
      disabled={!onLeavingAtomChange}
      ref={containerRef}
    />
  );
};

export default ReadonlyAttachmentPoint;
