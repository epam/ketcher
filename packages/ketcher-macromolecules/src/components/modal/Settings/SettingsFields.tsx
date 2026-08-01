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

import { KetcherLogger, Settings, SettingsFormValue } from 'ketcher-core';
import { SettingsField } from './SettingsField';
import { FIELD_DEFINITIONS, SettingOptionValue } from './fieldGroups';
import { FieldsContainer } from './Settings.styles';

interface SettingsFieldsProps {
  fields: Array<keyof Settings>;
  settings: SettingsFormValue;
  onChange: (partial: Partial<SettingsFormValue>) => void;
}

export const SettingsFields = ({
  fields,
  settings,
  onChange,
}: SettingsFieldsProps) => {
  const isSupportedSettingOptionValue = (
    value: SettingsFormValue[keyof SettingsFormValue],
  ): value is SettingOptionValue | undefined => {
    return (
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  };

  return (
    <FieldsContainer>
      {fields.map((fieldName) => {
        const field = FIELD_DEFINITIONS[fieldName as string];
        if (!field) {
          KetcherLogger.warn(
            `Field definition not found: ${String(fieldName)}`,
          );
          return null;
        }

        const value = settings[fieldName];
        if (!isSupportedSettingOptionValue(value)) {
          KetcherLogger.warn(
            `Unsupported settings value for field: ${String(fieldName)}`,
          );
          return null;
        }

        return (
          <SettingsField
            key={String(fieldName)}
            name={String(fieldName)}
            label={field.label}
            type={field.type}
            value={value}
            options={field.options}
            min={field.min}
            max={field.max}
            step={field.step}
            onChange={(value) => onChange({ [fieldName]: value })}
          />
        );
      })}
    </FieldsContainer>
  );
};
