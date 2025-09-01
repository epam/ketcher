import React, { useState, useEffect } from 'react';
import styles from './RLabelEditPopup.module.less';
import { Icon } from 'components';

interface RLabelEditPopupProps {
  atomId: number;
  currentRNumber: number;
  maxRNumber: number;
  // position: { x: number; y: number };
  onReassign: (atomId: number, newRNumber: number) => void;
  onDelete: (atomId: number) => void;
  onClose: () => void;
}

const RLabelEditPopup: React.FC<RLabelEditPopupProps> = ({
  atomId,
  currentRNumber,
  maxRNumber,
  // position,
  onReassign,
  onDelete,
  onClose,
}) => {
  const [selectedRNumber, setSelectedRNumber] = useState(currentRNumber);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const popup = document.getElementById('r-label-edit-popup');
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

  const handleReassign = () => {
    if (selectedRNumber !== currentRNumber) {
      onReassign(atomId, selectedRNumber);
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(atomId);
    onClose();
  };

  const rNumberOptions = Array.from({ length: maxRNumber }, (_, i) => i + 1);

  return (
    <div id="r-label-edit-popup" className={styles.popup}>
      <div className={styles.header}>
        <h3 className={styles.title}>Edit Attachment Point</h3>
        <button className={styles.closeButton} onClick={onClose}>
          <Icon name="close" />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.field}>
          <label className={styles.label}>R-Number:</label>
          <select
            className={styles.select}
            value={selectedRNumber}
            onChange={(e) => setSelectedRNumber(Number(e.target.value))}
          >
            {rNumberOptions.map((num) => (
              <option key={num} value={num}>
                R{num}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          title="Delete attachment point"
        >
          <Icon name="delete" />
          Delete
        </button>
        <button
          className={styles.applyButton}
          onClick={handleReassign}
          disabled={selectedRNumber === currentRNumber}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default RLabelEditPopup;
