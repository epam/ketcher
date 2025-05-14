import {
  ChangeEvent,
  KeyboardEvent,
  memo,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import styles from './RulerArea.module.less';

type Props = {
  lineLengthValue: number;
  offsetX: number;
  onCommitValue: (value: number) => void;
};

const RulerInput = ({ lineLengthValue, offsetX, onCommitValue }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  useLayoutEffect(() => {
    const inputElement = ref.current;
    if (!inputElement) {
      return;
    }
    inputElement.style.transform = `translateX(${offsetX}px)`;
  }, [offsetX]);

  const stringifiedLineLengthValue = lineLengthValue.toString();

  const [value, setValue] = useState(stringifiedLineLengthValue);
  if (value !== stringifiedLineLengthValue) {
    setValue(stringifiedLineLengthValue);
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    if (value.trim() === '') {
      setValue(stringifiedLineLengthValue);
      return;
    }

    const newValue = Number(value);
    if (Number.isNaN(newValue) || newValue < 1) {
      setValue(stringifiedLineLengthValue);
      return;
    }

    const newLineLength = Math.round(newValue / 10) * 10;
    setValue(newLineLength.toString());
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
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      ref={ref}
    />
  );
};

export default memo(RulerInput);
