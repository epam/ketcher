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

import {
  FormControlLabel,
  Checkbox,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
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
          <FormControlLabel
            control={
              <Checkbox
                checked={Boolean(value)}
                onChange={(e) => onChange(e.target.checked)}
                data-testid={`setting-${name}`}
              />
            }
            label={label}
          />
        );

      case 'number':
        return (
          <TextField
            type="number"
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(Number(e.target.value))}
            inputProps={{ min, max, step: step ?? 1 }}
            fullWidth
            size="small"
            data-testid={`setting-${name}`}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              label={label}
              data-testid={`setting-${name}`}
            >
              {options?.map((opt) => (
                <MenuItem key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'color':
        return (
          <TextField
            type="color"
            label={label}
            value={value ?? '#000000'}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            size="small"
            data-testid={`setting-${name}`}
          />
        );

      case 'text':
      default:
        return (
          <TextField
            label={label}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            fullWidth
            size="small"
            data-testid={`setting-${name}`}
          />
        );
    }
  };

  return <FieldWrapper>{renderField()}</FieldWrapper>;
};
