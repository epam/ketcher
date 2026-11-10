/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import MuiSelect, { type SelectChangeEvent } from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Select.module.less';
import { Icon } from 'components';
import { useTranslation } from 'react-i18next';

export interface Option {
  value: string;
  label: string;
  children?: ReactNode;
  disabled?: boolean;
  markedAsUsed?: boolean;
}

interface Props {
  options: Array<Option>;
  onChange: (value: string) => void;
  className?: string;
  value?: string | number;
  multiple?: boolean;
  disabled?: boolean;
  formName?: string;
  name?: string;
  placeholder?: string;
  'data-testid'?: string;
  error?: boolean;
  title?: string;
}

const ChevronIcon = ({ className }) => (
  <Icon name="chevron" className={className} />
);

// Safari reports `position: fixed` boxes shifted by the visual viewport offset
// when the page is zoomed, which displaces the MUI menu from its anchor.
const measureFixedOriginShift = () => {
  const probe = document.createElement('div');
  probe.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const { left, top } = probe.getBoundingClientRect();
  probe.remove();
  return { left, top };
};

const Select = ({
  className,
  value,
  onChange,
  multiple = false,
  disabled,
  options,
  formName,
  name,
  placeholder,
  'data-testid': testId,
  error,
  title,
}: Props) => {
  const { t } = useTranslation('common');
  const currentValue = options?.find((option) => option.value === value);
  const isFullscreen = !!document.fullscreenElement;
  const portalContainer = isFullscreen
    ? document.querySelector('#root')
    : undefined;

  const [fixedShift, setFixedShift] = useState({ left: 0, top: 0 });

  const handleOpen = () => setFixedShift(measureFixedOriginShift());

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value);
  };

  return (
    <MuiSelect
      className={clsx(styles.selectContainer, className)}
      value={currentValue?.value ?? ''}
      title={title}
      onChange={handleChange}
      onOpen={handleOpen}
      renderValue={(selected: string) =>
        currentValue?.children ?? currentValue?.label ?? placeholder ?? selected
      }
      displayEmpty
      multiple={multiple}
      disabled={disabled}
      placeholder={placeholder}
      MenuProps={{
        container: portalContainer,
        className: styles.dropdownList,
        PaperProps: {
          style: {
            marginLeft: -fixedShift.left,
            marginTop: -fixedShift.top,
          },
        },
      }}
      IconComponent={ChevronIcon}
      data-testid={testId}
      error={error}
    >
      {options?.map((option) => {
        const isDivider: boolean =
          typeof option?.value === 'string'
            ? option.value.includes('Divider')
            : false;

        return isDivider ? (
          <Divider className={styles.listDivider} key={option.value} />
        ) : (
          <MenuItem
            value={option.value}
            key={option.value}
            disableRipple={true}
            disabled={option.disabled}
            title={option.markedAsUsed ? t('alreadyInUse') : undefined}
            className={clsx({
              [`dropdown-${formName}_${name}`]: formName,
              [styles.usedOption]: option.markedAsUsed,
            })}
            data-testid={`${option.label}-option`}
          >
            <>{option.children ?? option.label}</>
          </MenuItem>
        );
      })}
    </MuiSelect>
  );
};

export default Select;
