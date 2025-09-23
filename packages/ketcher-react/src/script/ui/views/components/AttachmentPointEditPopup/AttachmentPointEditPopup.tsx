import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  AtomLabel,
  AttachmentPointClickData,
  AttachmentPointName,
  getAttachmentPointNumberFromLabel,
} from 'ketcher-core';
import Select from '../../../component/form/Select';

import styles from './AttachmentPointEditPopup.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Editor } from '../../../../editor';
import assert from 'assert';
import { isNumber } from 'lodash';

type Props = {
  data: AttachmentPointClickData | null;
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

  if (!data || !editor.monomerCreationState) {
    return null;
  }

  const { attachmentPointName, position } = data;
  const { assignedAttachmentPoints } = editor.monomerCreationState;

  const atomPair = assignedAttachmentPoints.get(attachmentPointName);
  assert(atomPair);

  const [attachmentAtomId, leavingAtomId] = atomPair;
  const attachmentAtom = editor.struct().atoms.get(attachmentAtomId);
  assert(attachmentAtom);

  const handleNameChange = (value: string) => {
    if (value !== attachmentPointName) {
      onNameChange(attachmentPointName, value as AttachmentPointName);
    }

    onClose();
  };

  const handleLeavingAtomChange = (value: string) => {
    const atomId = parseInt(value, 10);
    if (atomId !== leavingAtomId) {
      onLeavingAtomChange(attachmentPointName, atomId);
    }

    onClose();
  };

  const attachmentPointNameOptionsLength = Math.max(
    ...Array.from(assignedAttachmentPoints.keys()).map(
      getAttachmentPointNumberFromLabel,
    ),
  );

  const attachmentPointNameOptions = Array.from({
    length: attachmentPointNameOptionsLength,
  }).map((_, i) => ({
    value: `R${i + 1}`,
    label: `R${i + 1}`,
  }));

  let alternativeLeavingAtomOptions = editor
    .findPotentialLeavingAtoms(attachmentAtomId)
    .map((atom) => {
      const atomId = editor.struct().atoms.keyOf(atom);
      assert(isNumber(atomId));

      let label = atom.label;
      if (atom.implicitH > 0) {
        label = label.concat(
          atom.implicitH > 1 ? `${AtomLabel.H}${atom.implicitH}` : AtomLabel.H,
        );
      }

      return {
        value: atomId.toString(),
        label,
      };
    });
  if (attachmentAtom.implicitH > 0) {
    alternativeLeavingAtomOptions = alternativeLeavingAtomOptions.concat({
      value: '-1',
      label: AtomLabel.H,
    });
  }

  const currentNameOption = attachmentPointNameOptions.find(
    (option) => option.value === attachmentPointName,
  );
  const currentLeavingAtomOption = alternativeLeavingAtomOptions.find(
    (option) => option.value === leavingAtomId.toString(),
  );

  return (
    <div
      className={clsx(selectStyles.selectContainer, styles.popup)}
      style={{ top: position.y, left: position.x }}
      ref={popupRef}
    >
      <p className={styles.title}>Edit connection point</p>
      <div className={styles.selectsWrapper}>
        <Select
          className={styles.select}
          options={attachmentPointNameOptions}
          value={currentNameOption?.value}
          onChange={(value) => handleNameChange(value)}
        />
        <Select
          options={alternativeLeavingAtomOptions}
          value={currentLeavingAtomOption?.value}
          onChange={(value) => handleLeavingAtomChange(value)}
        />
      </div>
    </div>
  );
};

export default AttachmentPointEditPopup;
