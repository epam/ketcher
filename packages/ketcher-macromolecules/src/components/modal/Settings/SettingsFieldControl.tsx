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

import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { SettingsFieldRow, type SettingsFieldLayout } from 'ketcher-react';
import {
  UNIT_OPTIONS,
  type SettingFieldValue,
  type SettingsFieldControlType,
  type SettingsFieldDescriptor,
} from './settingsFields';

/**
 * Only namespace-qualified keys ("settings:…", "dialogs:…") are translated.
 * Everything else is literal text that must render unchanged in every language —
 * font family names and the schema's own plain enum names — and resolving those
 * through t() would log a spurious missing-key warning.
 */
const resolveLabel = (key: string, t: TFunction) =>
  key.includes(':') ? t(key) : key;

const LAYOUT_BY_CONTROL: Record<SettingsFieldControlType, SettingsFieldLayout> =
  {
    checkbox: 'toggle',
    number: 'measure',
    text: 'measure',
    select: 'select',
    color: 'color',
  };

interface SettingsFieldControlProps {
  field: SettingsFieldDescriptor;
  value: SettingFieldValue | undefined;
  unitValue?: SettingFieldValue;
  onChange: (value: SettingFieldValue) => void;
  onUnitChange?: (value: SettingFieldValue) => void;
}

export const SettingsFieldControl = ({
  field,
  value,
  unitValue,
  onChange,
  onUnitChange,
}: SettingsFieldControlProps) => {
  const { t } = useTranslation();
  const { name, labelKey, control, options, min, max, step, hintKey } = field;
  const testId = `setting-${name}`;

  const stringValue = typeof value === 'string' ? value : undefined;
  const numberValue = typeof value === 'number' ? value : undefined;

  const renderControl = () => {
    switch (control) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            data-testid={testId}
          />
        );

      case 'number':
        return (
          <>
            <input
              type="number"
              value={numberValue ?? ''}
              onChange={(event) => onChange(Number(event.target.value))}
              min={min}
              max={max}
              step={step ?? 1}
              data-testid={testId}
            />
            {field.unitName && (
              <select
                value={String(unitValue ?? '')}
                onChange={(event) => onUnitChange?.(event.target.value)}
                data-testid={`${testId}-unit`}
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={String(unit.value)} value={String(unit.value)}>
                    {resolveLabel(unit.labelKey, t)}
                  </option>
                ))}
              </select>
            )}
          </>
        );

      case 'select':
        return (
          <select
            value={String(value ?? '')}
            onChange={(event) => {
              const option = options?.find(
                (candidate) => String(candidate.value) === event.target.value,
              );
              onChange(option?.value ?? event.target.value);
            }}
            data-testid={testId}
          >
            {options?.map((option) => (
              <option key={String(option.value)} value={String(option.value)}>
                {resolveLabel(option.labelKey, t)}
              </option>
            ))}
          </select>
        );

      case 'color':
        return (
          <input
            type="color"
            value={stringValue ?? '#000000'}
            onChange={(event) => onChange(event.target.value)}
            data-testid={testId}
          />
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={stringValue ?? ''}
            onChange={(event) => onChange(event.target.value)}
            data-testid={testId}
          />
        );
    }
  };

  return (
    <SettingsFieldRow
      label={resolveLabel(labelKey, t)}
      layout={LAYOUT_BY_CONTROL[control]}
      hint={hintKey ? resolveLabel(hintKey, t) : undefined}
      testId={`${testId}-row`}
    >
      {renderControl()}
    </SettingsFieldRow>
  );
};
