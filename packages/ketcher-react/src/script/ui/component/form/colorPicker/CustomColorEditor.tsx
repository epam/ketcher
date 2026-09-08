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

import classes from './ColorPicker.module.less';
import { Icon } from 'components';
import { hslToHex } from './ColorPicker.utils';
import ColorSlider from './ColorSlider';
import { type ChangeEvent } from 'react';

const HUE_BACKGROUND =
  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';

interface CustomColorEditorProps {
  customColors: string[] | readonly string[];
  pendingColor: string;
  hue: number;
  lightness: number;
  hexInput: string;
  onHueChange: (h: number) => void;
  onLightnessChange: (sliderLightness: number) => void;
  onHexInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDeleteCustomColor: () => void;
}

function CustomColorEditor({
  customColors,
  pendingColor,
  hue,
  lightness,
  hexInput,
  onHueChange,
  onLightnessChange,
  onHexInputChange,
  onDeleteCustomColor,
}: CustomColorEditorProps) {
  const lightnessBg = `linear-gradient(to right, #ffffff, ${hslToHex(
    hue,
    100,
    50,
  )}, #000000)`;
  const canDeleteCustomColor = customColors.some(
    (color) => color.toUpperCase() === pendingColor.toUpperCase(),
  );

  return (
    <>
      <div className={classes.slidersRow} data-testid="color-palette">
        <div className={classes.slidersCol}>
          <ColorSlider
            value={hue}
            min={0}
            max={360}
            onValueChange={onHueChange}
            background={HUE_BACKGROUND}
            thumbColor={hslToHex(hue, 100, 50)}
            ariaLabel="Hue"
          />
          <ColorSlider
            value={100 - lightness}
            min={0}
            max={100}
            onValueChange={onLightnessChange}
            background={lightnessBg}
            thumbColor={pendingColor}
            ariaLabel="Lightness"
          />
        </div>
        <div
          className={classes.colorPreviewBox}
          style={{ backgroundColor: pendingColor }}
          aria-label="Color preview"
        />
      </div>

      <div className={classes.hexRow}>
        <div className={classes.hexInputGroup}>
          <label className={classes.hexLabel} htmlFor="hex-input">
            HEX#
          </label>
          <input
            id="hex-input"
            type="text"
            value={hexInput}
            onChange={onHexInputChange}
            className={classes.hexInput}
            maxLength={6}
            placeholder="RRGGBB"
            data-testid="color-picker-input"
          />
        </div>
        <button
          type="button"
          className={classes.deleteBtn}
          onClick={onDeleteCustomColor}
          aria-label="Delete custom color"
          disabled={!canDeleteCustomColor}
        >
          <Icon name="delete" className={classes.deleteIcon} />
        </button>
      </div>
    </>
  );
}

export default CustomColorEditor;
