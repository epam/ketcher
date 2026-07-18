/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';

import { HexColorPicker, HexColorInput } from 'react-colorful';
import classes from './ColorPicker.module.less';
import clsx from 'clsx';
import { Icon } from 'components';

interface ColorPickerProps {
  value: string;
  name: string;
}

interface ColorPickerCallProps {
  onChange: (value: string) => void;
}

type Props = ColorPickerProps & ColorPickerCallProps;

type ToggleEvent = MouseEvent | KeyboardEvent | FocusEvent;

const CLICK_THROTTLE_DELAY_MS = 200;

const presetColors = [
  '#FF4545',
  '#FFAD31',
  '#68D442',
  '#3ACACC',
  '#4434FF',
  '#9C9C9C',
  '#000000',
];

const ColorPicker = (props: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const { onChange, value } = props;
  const paletteId = 'color-picker-' + useId();
  const clickThrottleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleChange = useCallback(
    (color: string) => {
      onChange(color);
    },
    [onChange],
  );

  const handleClick = useCallback((event: ToggleEvent) => {
    if (clickThrottleTimeoutRef.current) {
      return;
    }

    event.preventDefault();
    setIsOpen((prev) => !prev);
    setIsPaletteOpen(false);
    clickThrottleTimeoutRef.current = setTimeout(() => {
      clickThrottleTimeoutRef.current = null;
    }, CLICK_THROTTLE_DELAY_MS);
  }, []);

  const handlePaletteOpen = () => {
    setIsPaletteOpen(true);
  };
  const handleColorChange = (color: string) => {
    handleChange(color);
  };

  const handleBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      handleClick(e);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  const handleWrapperKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <div
      className={classes.colorPickerWrapper}
      data-testid={isOpen ? 'color-picker-field-open' : 'color-picker-field'}
      onClick={(e) => e.preventDefault()}
      onKeyDown={handleWrapperKeyDown}
      role="none"
    >
      <button
        type="button"
        className={clsx({
          [classes.colorPickerInput]: true,
          [classes.selectedInput]: isOpen,
        })}
        aria-controls={paletteId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div
          className={classes.colorPickerPreview}
          data-testid={`${props.name}-color-picker-preview`}
          style={{ backgroundColor: value }}
        />

        <Icon
          className={clsx({
            [classes.expandIcon]: true,
            [classes.turnedIcon]: !isOpen,
          })}
          name="chevron"
        />
      </button>
      {isOpen && (
        <div
          className={clsx(
            classes.colorPickerWrap,
            isPaletteOpen && classes.withPalette,
          )}
          id={paletteId}
          onBlur={handleBlur}
          data-testid="color-picker-preset"
          role="none"
        >
          <div className={classes.presetColors}>
            <button
              className={clsx(
                classes.chooseColor,
                isPaletteOpen && classes.clicked,
              )}
              onClick={handlePaletteOpen}
              autoFocus
              data-testid="color-picker-btn"
            />
            {presetColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{ backgroundColor: color }}
                className={classes.presetColor}
              />
            ))}
          </div>

          {isPaletteOpen && (
            <div className={classes.colorPicker} data-testid="color-palette">
              <HexColorPicker color={value} onChange={handleChange} />
              <div className={classes.colorContainer}>
                <span className={classes.hex}>HEX</span>
                <HexColorInput
                  data-testid="color-picker-input"
                  color={value}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
