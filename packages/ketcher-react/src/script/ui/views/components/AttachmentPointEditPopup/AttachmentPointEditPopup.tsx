import { useEffect, useRef } from 'react';
import { AttachmentPointName } from 'domain/types';
import Select from '../../../component/form/Select';

import styles from './AttachmentPointEditPopup.module.less';

type Props = {
  atomId: number;
  currentRNumber: number;
  // position: { x: number; y: number };
  onReassign: (
    atomId: number,
    attachmentPointName: AttachmentPointName,
  ) => void;
  onClose: VoidFunction;
};

const rNumberOptions = Array.from({ length: 8 }).map((_, i) => ({
  value: `R${i + 1}`,
  label: `R${i + 1}`,
}));

const AttachmentPointEditPopup = ({
  atomId,
  currentRNumber,
  // position,
  onReassign,
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

  const currentRNumberStr = `R${currentRNumber}`;

  const handleReassign = (value: string) => {
    if (value !== currentRNumberStr) {
      onReassign(atomId, value);
    }

    onClose();
  };

  const currentOption = rNumberOptions.find(
    (option) => option.value === currentRNumberStr,
  );

  return (
    <div className={styles.popup} ref={popupRef}>
      <p className={styles.title}>Edit connection point</p>
      <Select
        options={rNumberOptions}
        value={currentOption?.label}
        onChange={(value) => handleReassign(value)}
      />
    </div>
  );
};

export default AttachmentPointEditPopup;
