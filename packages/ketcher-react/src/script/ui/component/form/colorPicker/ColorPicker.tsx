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

import { type ChangeEvent, useId, useRef, useState } from 'react';
import { Popover } from '@mui/material';

import classes from './ColorPicker.module.less';
import clsx from 'clsx';
import { Icon } from 'components';
import { useSettings } from 'src/hooks';
import {
  addCustomColor,
  hslToHex,
  hexToHsl,
  isValidHex,
  sanitizeHexInput,
} from './ColorPicker.utils';
import PresetGrid from './PresetGrid';
import CustomColorSwatches from './CustomColorSwatches';
import CustomColorEditor from './CustomColorEditor';

interface Props {
  value: string;
  name: string;
  onChange: (value: string) => void;
}

const DEFAULT_COLOR = '#FF3232';
const DEFAULT_CUSTOM_COLORS = [];

const ColorPicker = (props: Props) => {
  const { onChange, value } = props;
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [pendingColor, setPendingColor] = useState(value || DEFAULT_COLOR);
  const customColors =
    settings?.colorPickerCustomColors ?? DEFAULT_CUSTOM_COLORS;
  const [hue, setHue] = useState(0);
  const [lightness, setLightness] = useState(50);
  const [hexInput, setHexInput] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const paletteId = 'color-picker-' + useId();

  const applyHexColor = (hex: string) => {
    setPendingColor(hex);
    const { h, l } = hexToHsl(hex);
    setHue(h);
    setLightness(l);
    setHexInput(hex.replace('#', '').toUpperCase());
  };

  const applyColorFromHsl = (h: number, l: number) => {
    const hex = hslToHex(h, 100, l);
    setPendingColor(hex);
    setHexInput(hex.replace('#', ''));
  };

  const handleToggleOpen = () => {
    if (!isOpen) {
      const initialColor = value || DEFAULT_COLOR;
      applyHexColor(initialColor);
      setIsCustomOpen(false);

      const newColors = addCustomColor(
        [...(settings?.colorPickerCustomColors ?? [])],
        initialColor,
      );
      updateSettings({ colorPickerCustomColors: newColors });
    }
    setIsOpen(!isOpen);
  };

  const handleHueChange = (h: number) => {
    setHue(h);
    applyColorFromHsl(h, lightness);
  };

  const handleLightnessChange = (sliderLightness: number) => {
    const l = 100 - sliderLightness;
    setLightness(l);
    applyColorFromHsl(hue, l);
  };

  const handleHexInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = sanitizeHexInput(e.target.value);
    setHexInput(raw);
    if (isValidHex(raw)) {
      applyHexColor('#' + raw);
    }
  };

  const selectedCustomColor = customColors.find(
    (color) => color.toUpperCase() === pendingColor.toUpperCase(),
  );

  const handleDeleteCustomColor = () => {
    if (!selectedCustomColor) {
      return;
    }

    const newColors = customColors.filter(
      (color) => color.toUpperCase() !== selectedCustomColor.toUpperCase(),
    );
    updateSettings({ colorPickerCustomColors: newColors });
  };

  const handleApply = () => {
    onChange(pendingColor);
    if (isCustomOpen) {
      const newColors = addCustomColor(customColors, pendingColor);
      updateSettings({ colorPickerCustomColors: newColors });
    }
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
        <PresetGrid
          selectedColor={pendingColor}
          onSelectColor={applyHexColor}
        />

        <div className={classes.customSection}>
          <CustomColorSwatches
            customColors={customColors}
            pendingColor={pendingColor}
            onSelectColor={applyHexColor}
            isCustomOpen={isCustomOpen}
            onToggleCustomOpen={() => setIsCustomOpen((prev) => !prev)}
          />

          {isCustomOpen && (
            <CustomColorEditor
              customColors={customColors}
              pendingColor={pendingColor}
              hue={hue}
              lightness={lightness}
              hexInput={hexInput}
              onHueChange={handleHueChange}
              onLightnessChange={handleLightnessChange}
              onHexInputChange={handleHexInputChange}
              onDeleteCustomColor={handleDeleteCustomColor}
            />
          )}

          <div className={classes.actionRow}>
            <button
              type="button"
              className={classes.cancelBtn}
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className={classes.applyBtn}
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      </Popover>
    </div>
  );
};

export default ColorPicker;
