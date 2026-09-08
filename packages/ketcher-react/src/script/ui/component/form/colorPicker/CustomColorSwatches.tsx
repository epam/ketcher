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
import { Icon } from 'components';

interface CustomColorSwatchesProps {
  customColors: string[] | readonly string[];
  pendingColor: string;
  onSelectColor: (color: string) => void;
  isCustomOpen: boolean;
  onToggleCustomOpen: () => void;
}

function CustomColorSwatches({
  customColors,
  pendingColor,
  onSelectColor,
  isCustomOpen,
  onToggleCustomOpen,
}: CustomColorSwatchesProps) {
  return (
    <div className={classes.headerGroup}>
      <div className={classes.customHeader}>
        <span className={classes.customLabel}>Custom Colors</span>
        <button
          type="button"
          className={clsx(
            classes.customToggleBtn,
            !isCustomOpen && classes.customToggleBtnPlus,
            isCustomOpen && classes.customToggleBtnClose,
          )}
          onClick={onToggleCustomOpen}
          aria-label={
            isCustomOpen ? 'Close custom colors' : 'Open custom colors'
          }
          data-testid="color-picker-btn"
        >
          {isCustomOpen ? (
            <Icon name="close" className={classes.toggleIcon} />
          ) : (
            <span className={classes.plusIcon}>+</span>
          )}
        </button>
      </div>

      {customColors.length > 0 && (
        <div className={classes.customSwatchRow}>
          {customColors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              style={{ backgroundColor: color }}
              className={clsx(
                classes.customSwatch,
                pendingColor.toUpperCase() === color.toUpperCase() &&
                  classes.swatchSelected,
              )}
              aria-label={color}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomColorSwatches;
