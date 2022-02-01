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

import { ReactElement } from 'react'
import styles from './Select.module.less'
import clsx from 'clsx'

import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Icon from '../../../view/icon'

export interface Option {
  value: string
  label: string
}

interface Props {
  className?: string
  value: string
  onChange: (any) => void
  singleSelect?: boolean
  disabled?: boolean
  options: Array<Option>
}

const ChevronIcon = ({ className }) => (
  <Icon name="chevron" className={clsx(className, styles.chevronIcon)} />
)

const Select = ({
  className,
  value,
  onChange,
  singleSelect = true,
  disabled,
  options
}: Props): ReactElement => {
  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  return (
    <FormControl>
      <MuiSelect
        className={clsx(styles.selectContainer, className)}
        value={value}
        onChange={handleChange}
        multiple={!singleSelect}
        disabled={disabled}
        MenuProps={{ className: styles.dropdownList }}
        IconComponent={ChevronIcon}
      >
        {options &&
          options.map((option) => {
            return (
              <MenuItem
                value={option.value}
                key={option.value}
                disableRipple={true}
              >
                {option.label}
              </MenuItem>
            )
          })}
      </MuiSelect>
    </FormControl>
  )
}

export default Select
