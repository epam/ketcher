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

import type { ReactNode } from 'react';
import clsx from 'clsx';
import classes from './SettingsPanel.module.less';

/**
 * - `toggle`         — label left, switch right
 * - `measure`        — label left, number input + unit dropdown right
 * - `measure-stacked`— label above, number input + unit dropdown below (compact width)
 * - `select`         — label above a full-width dropdown
 * - `color`          — label left, colour swatch dropdown right
 */
export type SettingsFieldLayout =
  'toggle' | 'measure' | 'measure-stacked' | 'select' | 'color';

export interface SettingsFieldRowProps {
  label: string;
  layout: SettingsFieldLayout;
  /** Description rendered as static grey text directly beneath the control */
  hint?: string;
  hintAlign?: 'left' | 'right';
  children: ReactNode;
  className?: string;
  testId?: string;
}

const SettingsFieldRow = ({
  label,
  layout,
  hint,
  hintAlign,
  children,
  className,
  testId,
}: SettingsFieldRowProps) => {
  const isStackedRow = layout === 'select' || layout === 'measure-stacked';
  // 'select' forces full-width controls; 'measure-stacked' keeps compact control width
  const isFullWidthControl = layout === 'select';

  return (
    <div
      className={clsx(classes.fieldRow, className)}
      data-testid={testId}
      data-layout={layout}
    >
      <div
        className={
          isStackedRow ? classes.fieldRowStacked : classes.fieldRowInline
        }
      >
        <span className={classes.fieldLabel}>{label}</span>
        <div
          className={
            isFullWidthControl
              ? classes.fieldControlStacked
              : layout === 'measure-stacked'
                ? classes.fieldControlMeasureStacked
                : classes.fieldControl
          }
        >
          {children}
        </div>
      </div>
      {hint && (
        <span
          className={clsx(classes.hint, {
            [classes.hintRight]: hintAlign === 'right',
          })}
        >
          {hint}
        </span>
      )}
    </div>
  );
};

export default SettingsFieldRow;
