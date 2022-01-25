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
import Select from 'react-select'

export interface Option {
  value: string
  label: string
}

interface Props {
  options: Array<Option>
  searchable?: boolean
  className?: string
  defaultValue?: Option
  onChange: (any) => void
  value?: Option
  disabled?: boolean
  portalTarget?: HTMLElement
}

const ReactSelect = ({
  options,
  searchable = false,
  className,
  defaultValue,
  onChange,
  value,
  disabled,
  portalTarget
}: Props): ReactElement => {
  const handleChange = (option): void => {
    onChange(option.value)
  }

  return (
    <div className={className}>
      <Select
        className="react-select-container"
        classNamePrefix="react-select"
        options={options}
        defaultValue={defaultValue || options?.[0]}
        isSearchable={searchable}
        onChange={handleChange}
        value={value}
        isDisabled={disabled}
        menuShouldScrollIntoView={true}
        menuPortalTarget={portalTarget}
      />
    </div>
  )
}

export default ReactSelect
