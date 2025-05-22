import {
  ChangeEvent,
  KeyboardEvent,
  memo,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { LayoutMode } from 'ketcher-core';

import styles from './RulerArea.module.less';

type Props = {
  lineLengthValue: number;
  offsetX: number;
  layoutMode: LayoutMode;
  onCommitValue: (value: number) => void;
};

const RulerInput = ({
  lineLengthValue,
  offsetX,
  layoutMode,
  onCommitValue,
}: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const inputElement = ref.current;
    if (!inputElement) {
      return;
    }
    inputElement.style.transform = `translateX(${offsetX}px)`;
  }, [offsetX]);

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
      className={styles.rulerInput}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={ref}
    />
  );
};

export default memo(RulerInput);
