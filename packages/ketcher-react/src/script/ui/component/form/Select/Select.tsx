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

import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import { useEffect, useState } from 'react'
import clsx from 'clsx'
import styles from './Select.module.less'

import Icon from '../../view/icon'

export interface Option {
  value: string
  label: string
}

interface Props {
  options: Array<Option>
  onChange: (value: string) => void
  className?: string
  value?: string
  multiple?: boolean
  disabled?: boolean
}

const ChevronIcon = ({ className }) => (
  <Icon name="chevron" className={clsx(className, styles.chevronIcon)} />
)

const Select = ({
  className,
  value,
  onChange,
  multiple = false,
  disabled,
  options
}: Props) => {
  const [currentValue, setCurrentValue] = useState<Option>()

  useEffect(() => {
    let option
    if (options) {
      option = options.find((option) => option.value === value)
    }
    return setCurrentValue(option)
  }, [options, value])

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  return (
    <MuiSelect
      className={clsx(styles.selectContainer, className)}
      value={currentValue?.value ?? ''}
      onChange={handleChange}
      multiple={multiple}
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
  )
}

export default Select
