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

import clsx from 'clsx';

import classes from './ColorPicker.module.less';
import { presetColors } from './ColorPicker.constants';

interface PresetGridProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

function PresetGrid({ selectedColor, onSelectColor }: PresetGridProps) {
  return (
    <div className={classes.presetGrid} data-testid="color-picker-preset-grid">
      {presetColors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onSelectColor(color)}
          style={{ backgroundColor: color }}
          className={clsx(
            classes.presetSwatch,
            selectedColor.toUpperCase() === color.toUpperCase() &&
              classes.swatchSelected,
          )}
          aria-label={color}
        />
      ))}
    </div>
  );
}

export default PresetGrid;
