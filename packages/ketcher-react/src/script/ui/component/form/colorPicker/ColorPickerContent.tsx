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

import { type ChangeEvent, useEffect, useLayoutEffect, useState } from 'react';

import classes from './ColorPicker.module.less';
import { useSettings } from 'src/hooks';
import {
  addCustomColor,
  hexToHsl,
  hslToHex,
  isValidHex,
  sanitizeHexInput,
} from './ColorPicker.utils';
import PresetGrid from './PresetGrid';
import CustomColorSwatches from './CustomColorSwatches';
import CustomColorEditor from './CustomColorEditor';

const DEFAULT_COLOR = '#FF3232';
const DEFAULT_CUSTOM_COLORS: string[] = [];

interface ColorPickerContentProps {
  value: string;
  onCancel: () => void;
  onApply: (color: string) => void;
  onContentResize: () => void;
}

function ColorPickerContent({
  value,
  onCancel,
  onApply,
  onContentResize,
}: ColorPickerContentProps) {
  const { settings, updateSettings } = useSettings();
  const customColors =
    settings?.colorPickerCustomColors ?? DEFAULT_CUSTOM_COLORS;

  const [pendingColor, setPendingColor] = useState(value || DEFAULT_COLOR);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const initialHsl = hexToHsl(pendingColor);
  const [hue, setHue] = useState(initialHsl.h);
  const [lightness, setLightness] = useState(initialHsl.l);
  const [hexInput, setHexInput] = useState(
    pendingColor.replace('#', '').toUpperCase(),
  );
  // The custom-color editor changes the popover's content height, but MUI's
  // Popover only recalculates its position on its own re-renders — toggling
  // state here doesn't trigger one, so we have to ask it to reposition.
  useLayoutEffect(() => {
    onContentResize();
  }, [isCustomOpen, onContentResize]);

  // Seed the currently-selected color into the custom-color list once, when
  // the picker opens (ColorPickerContent mounts fresh on every open).
  useEffect(() => {
    if (settings === null) {
      return;
    }

    const newColors = addCustomColor(customColors, pendingColor);
    updateSettings({ colorPickerCustomColors: newColors });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount
  }, []);

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
    if (isCustomOpen) {
      const newColors = addCustomColor(customColors, pendingColor);
      updateSettings({ colorPickerCustomColors: newColors });
    }
    onApply(pendingColor);
  };

  return (
    <>
      <PresetGrid selectedColor={pendingColor} onSelectColor={applyHexColor} />

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
            onClick={onCancel}
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
    </>
  );
}

export default ColorPickerContent;
