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

import { Select, MenuItem, FormControl, Switch } from '@mui/material';
import { FieldWrapper } from './Settings.styles';

interface SettingsFieldProps {
  name: string;
  label: string;
  type: 'checkbox' | 'number' | 'text' | 'select' | 'color';
  value: any;
  onChange: (value: any) => void;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
}

export const SettingsField = ({
  name,
  label,
  type,
  value,
  onChange,
  options,
  min,
  max,
  step,
}: SettingsFieldProps) => {
  const renderField = () => {
    switch (type) {
      case 'checkbox':
        return (
          <label>
            <span>{label}</span>
            <Switch
              checked={Boolean(value)}
              onChange={(e) => onChange(e.target.checked)}
              size="small"
              data-testid={`setting-${name}`}
            />
          </label>
        );

      case 'number':
        return (
          <label>
            <span>{label}</span>
            <input
              type="number"
              value={value ?? ''}
              onChange={(e) => onChange(Number(e.target.value))}
              min={min}
              max={max}
              step={step ?? 1}
              data-testid={`setting-${name}`}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                height: '24px',
                border: '1px solid #cad3dd',
                borderRadius: '2px',
              }}
            />
          </label>
        );

      case 'select':
        return (
          <label>
            <span>{label}</span>
            <FormControl size="small" sx={{ border: 'none' }}>
              <Select
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                displayEmpty
                data-testid={`setting-${name}`}
                sx={{
                  fontSize: '12px',
                  height: '24px',
                  border: 'none',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: '1px solid #cad3dd',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#167782',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#167782',
                  },
                }}
              >
                {options?.map((opt) => (
                  <MenuItem
                    key={String(opt.value)}
                    value={opt.value}
                    sx={{ fontSize: '12px' }}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </label>
        );

      case 'color':
        return (
          <label>
            <span>{label}</span>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="color"
                value={value ?? '#000000'}
                onChange={(e) => onChange(e.target.value)}
                data-testid={`setting-${name}`}
                style={{
                  width: '30px',
                  height: '24px',
                  border: '1px solid #cad3dd',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              />
              <input
                type="text"
                value={value ?? '#000000'}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: '85px',
                  fontSize: '12px',
                  padding: '4px 8px',
                  height: '24px',
                  border: '1px solid #cad3dd',
                  borderRadius: '2px',
                }}
              />
            </div>
          </label>
        );

      case 'text':
      default:
        return (
          <label>
            <span>{label}</span>
            <input
              type="text"
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              data-testid={`setting-${name}`}
              style={{
                fontSize: '12px',
                padding: '4px 8px',
                height: '24px',
                border: '1px solid #cad3dd',
                borderRadius: '2px',
              }}
            />
          </label>
        );
    }
  };

  return <FieldWrapper>{renderField()}</FieldWrapper>;
};
