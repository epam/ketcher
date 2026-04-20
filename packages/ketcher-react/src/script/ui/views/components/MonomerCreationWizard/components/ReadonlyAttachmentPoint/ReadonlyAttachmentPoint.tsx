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
};

/**
 * Displays a readonly (inter-component connection) attachment point.
 * Hovering highlights the corresponding atom on canvas,
 * and hovering the atom on canvas highlights this row in the panel.
 */
const ReadonlyAttachmentPoint = ({ name, leavingAtomLabel, editor }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState(false);

  // Panel hover → canvas highlight
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const mouseOverHandler = () => {
      editor.highlightConnectionAttachmentPoint(name);
    };
    const mouseLeaveHandler = () => {
      editor.highlightConnectionAttachmentPoint(null);
    };

    element.addEventListener('mouseover', mouseOverHandler);
    element.addEventListener('mouseleave', mouseLeaveHandler);

    return () => {
      element.removeEventListener('mouseover', mouseOverHandler);
      element.removeEventListener('mouseleave', mouseLeaveHandler);
    };
  }, [editor, name]);

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
    leavingAtomLabel,
  );

  return (
    <AttachmentPointControls
      data={selectsData}
      onNameChange={() => null}
      onLeavingAtomChange={() => null}
      className={styles.selects}
      highlight={highlight}
      disabled
      ref={containerRef}
    />
  );
};

export default ReadonlyAttachmentPoint;
