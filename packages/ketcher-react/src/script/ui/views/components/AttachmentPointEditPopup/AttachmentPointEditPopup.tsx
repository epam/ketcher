import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import {
  AtomLabel,
  AttachmentPointClickData,
  AttachmentPointName,
} from 'ketcher-core';
import Select, { Option } from '../../../component/form/Select';

import styles from './AttachmentPointEditPopup.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';

type Props = {
  data: AttachmentPointClickData | null;
  onNameChange: (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => void;
  onAtomChange: (atomId: number, atomLabel: string) => void;
  onClose: VoidFunction;
};

const attachmentPointNameOptions = Array.from({ length: 8 }).map((_, i) => ({
  value: `R${i + 1}`,
  label: `R${i + 1}`,
}));

const attachmentPointAtomOptions: Array<Option> = [
  { value: AtomLabel.H, label: 'H' },
  { value: AtomLabel.O, label: 'OH' },
  { value: AtomLabel.N, label: 'NH2' },
  { value: AtomLabel.Cl, label: 'Cl' },
  { value: AtomLabel.F, label: 'F' },
];

const AttachmentPointEditPopup = ({
  data,
  onNameChange,
  onAtomChange,
  onClose,
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

  if (!data) {
    return null;
  }

  const { atomId, atomLabel, attachmentPointName, position } = data;

  const handleNameChange = (value: string) => {
    if (value !== attachmentPointName) {
      onNameChange(attachmentPointName, value as AttachmentPointName);
    }

    onClose();
  };

  const handleAtomChange = (value: string) => {
    if (value !== atomLabel) {
      onAtomChange(atomId, value);
    }

    onClose();
  };

  const currentNameOption = attachmentPointNameOptions.find(
    (option) => option.value === attachmentPointName,
  );
  const currentAtomOption = attachmentPointAtomOptions.find(
    (option) => option.value === atomLabel,
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
          options={attachmentPointAtomOptions}
          value={currentAtomOption?.value}
          onChange={(value) => handleAtomChange(value)}
        />
      </div>
    </div>
  );
};

export default AttachmentPointEditPopup;
