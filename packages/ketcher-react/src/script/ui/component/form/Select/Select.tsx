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

import { ReactElement, useEffect, useState } from 'react'
import styles from './Select.module.less'
import clsx from 'clsx'

import MuiSelect, { SelectChangeEvent } from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import MenuItem from '@mui/material/MenuItem'
import Icon from '../../view/icon'

interface Option {
  value: string
  label: string
}

interface Props {
  schema?: any
  className?: string
  value?: string
  onChange: (any) => void
  singleSelect?: boolean
  disabled?: boolean
  options?: Array<Option>
  searchable?: boolean
}

const getOptions = (schema): Array<Option> => {
  return schema.enum.reduce((options, value, index) => {
    options.push({
      value,
      label: schema?.enumNames?.[index] || value
    })

    return options
  }, [])
}

const ChevronIcon = ({ className }) => (
  <Icon name="chevron" className={clsx(className, styles.chevronIcon)} />
)

const Select = ({
  schema,
  className,
  value,
  onChange,
  singleSelect = true,
  disabled,
  options: selectOptions
}: // ...rest
Props): ReactElement => {
  const [defaultValue, setDefaultValue] = useState<any>()
  const [options, setOptions] = useState<Array<any>>([])

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  useEffect(() => {
    if (selectOptions === undefined) {
      return setOptions(getOptions(schema))
    }
    setOptions(selectOptions)
  }, [schema, selectOptions])

  useEffect(() => {
    let option
    if (options) {
      option = options.find((option) => option.value === value)
    }
    return setDefaultValue(option)
  }, [options, value])

  return (
    <FormControl>
      <MuiSelect
        className={clsx(styles.selectContainer, className)}
        value={defaultValue?.value ?? ''}
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
