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

import { useId, useRef, useState } from 'react';
import { Popover, type PopoverActions } from '@mui/material';

import classes from './ColorPicker.module.less';
import clsx from 'clsx';
import { Icon } from 'components';
import ColorPickerContent from './ColorPickerContent';

interface Props {
  value: string;
  name: string;
  onChange: (value: string) => void;
}

const ColorPicker = (props: Props) => {
  const { onChange, value } = props;
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverActionRef = useRef<PopoverActions>(null);
  const paletteId = 'color-picker-' + useId();
  const clickThrottleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(
    () => () => {
      if (clickThrottleTimeoutRef.current) {
        clearTimeout(clickThrottleTimeoutRef.current);
      }
    },
    [],
  );

  const handleContentResize = () => {
    popoverActionRef.current?.updatePosition();
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  const handleApply = (color: string) => {
    onChange(color);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={classes.colorPickerWrapper}
      data-testid={isOpen ? 'color-picker-field-open' : 'color-picker-field'}
      onClick={(e) => e.preventDefault()}
      role="none"
    >
      <button
        ref={triggerRef}
        type="button"
        className={clsx(
          classes.colorPickerInput,
          isOpen && classes.selectedInput,
        )}
        aria-controls={paletteId}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={handleToggleOpen}
      >
        <div
          className={classes.colorPickerPreview}
          data-testid={`${props.name}-color-picker-preview`}
          style={{ backgroundColor: value }}
        />
        <Icon
          className={clsx(classes.expandIcon, !isOpen && classes.turnedIcon)}
          name="chevron"
        />
      </button>

      <Popover
        id={paletteId}
        action={popoverActionRef}
        open={isOpen}
        anchorEl={triggerRef.current}
        onClose={handleCancel}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        PaperProps={{
          className: classes.colorPickerWrap,
          'data-testid': 'color-picker-preset',
        }}
      >
        <ColorPickerContent
          value={value}
          onCancel={handleCancel}
          onApply={handleApply}
          onContentResize={handleContentResize}
        />
      </Popover>
    </div>
  );
};

export default ColorPicker;
