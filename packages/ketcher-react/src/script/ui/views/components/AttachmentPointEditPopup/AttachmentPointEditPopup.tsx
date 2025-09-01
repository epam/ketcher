import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { AttachmentPointName } from 'domain/types';
import Select, { Option } from '../../../component/form/Select';
import { AttachmentPointEditPopupData } from '../MonomerCreationWizard/MonomerCreationWizard.types';

import styles from './AttachmentPointEditPopup.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';

type Props = {
  data: AttachmentPointEditPopupData | null;
  onNameChange: (
    atomId: number,
    attachmentPointName: AttachmentPointName,
  ) => void;
  onAtomChange: (atomId: number, atomLabel: string) => void;
  onClose: VoidFunction;
};

const attachmentPointNameOptions = Array.from({ length: 8 }).map((_, i) => ({
  value: `R${i + 1}`,
  label: `R${i + 1}`,
}));

const attachmentPointAtomOptions: Array<Option> = [
  { value: 'H', label: 'H' },
  { value: 'OH', label: 'OH' },
  { value: 'NH2', label: 'NH2' },
  { value: 'Cl', label: 'Cl' },
  { value: 'F', label: 'F' },
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
      if (popup && !popup.contains(event.target as Node)) {
        onClose();
      }
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
      onNameChange(atomId, value as AttachmentPointName);
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
          value={currentNameOption?.label}
          onChange={(value) => handleNameChange(value)}
        />
        <Select
          options={attachmentPointAtomOptions}
          value={currentAtomOption?.label}
          onChange={(value) => handleAtomChange(value)}
        />
      </div>
    </div>
  );
};

export default AttachmentPointEditPopup;
