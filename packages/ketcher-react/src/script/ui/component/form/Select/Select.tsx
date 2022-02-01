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

import MuiSelect, { Option } from './shared/Select'
import { useEffect, useState } from 'react'

interface Props {
  schema?: any
  className?: string
  value?: string
  onChange: (any) => void
  singleSelect?: boolean
  disabled?: boolean
  options?: Array<Option>
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

const Select = ({
  schema,
  className,
  value,
  onChange,
  singleSelect,
  disabled,
  options: selectOptions
}: Props) => {
  const [currentValue, setCurrentValue] = useState<any>()
  const [options, setOptions] = useState<Array<any>>([])

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
    return setCurrentValue(option)
  }, [options, value])

  return (
    <MuiSelect
      onChange={onChange}
      options={options}
      value={currentValue?.value ?? ''}
      singleSelect={singleSelect}
      disabled={disabled}
      className={className}
    />
  )
}

export default Select
