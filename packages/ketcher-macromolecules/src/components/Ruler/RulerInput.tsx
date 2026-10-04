import { ChangeEvent, KeyboardEvent, memo, useRef, useState } from 'react';
import clsx from 'clsx';
import { LayoutMode } from 'ketcher-core';

import useTranslateAlongXAxis from './useTranslateAlongXAxis';

import styles from './RulerArea.module.less';

type Props = {
  lineLengthValue: number;
  offsetX: number;
  isDragging: boolean;
  layoutMode: LayoutMode;
  onCommitValue: (value: number) => void;
};

const RulerInput = ({
  lineLengthValue,
  offsetX,
  isDragging,
  layoutMode,
  onCommitValue,
}: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  useTranslateAlongXAxis(ref, offsetX);

  const stringifiedLineLengthValue = lineLengthValue.toString();

  const [editingValue, setEditingValue] = useState<string | null>(null);
  const displayValue =
    editingValue !== null ? editingValue : stringifiedLineLengthValue;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEditingValue(event.target.value);
  };

  const handleBlur = () => {
    if (!editingValue || editingValue.trim() === '') {
      setEditingValue(null);
      return;
    }

    const newValue = Number(editingValue);
    if (Number.isNaN(newValue) || newValue < 1) {
      setEditingValue(null);
      return;
    }

    const newLineLength =
      layoutMode === 'sequence-layout-mode'
        ? Math.round(newValue / 10) * 10
        : newValue;

    setEditingValue(null);
    onCommitValue(newLineLength);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  return (
    <input
      className={clsx(
        styles.rulerInput,
        isDragging && styles.rulerInputDragging,
      )}
      title="Number of monomers in a line"
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      data-testid="ruler-input"
      disabled={isDragging}
      ref={ref}
    />
  );
};

export default memo(RulerInput);
