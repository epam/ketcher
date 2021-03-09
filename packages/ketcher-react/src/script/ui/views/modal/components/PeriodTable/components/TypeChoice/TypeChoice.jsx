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

import React from 'react'

import classes from './TypeChoice.module.less'

const typeSchema = [
  { title: 'Single', value: 'atom' },
  { title: 'List', value: 'list' },
  { title: 'Not List', value: 'not-list' }
]

function TypeChoice({ value, onChange, ...props }) {
  return (
    <fieldset className={classes.fieldset}>
      {typeSchema.map(type => (
        <label key={type.title}>
          <input
            type="radio"
            value={type.value}
            checked={type.value === value}
            onChange={() => onChange(type.value)}
            {...props}
          />
          {type.title}
        </label>
      ))}
    </fieldset>
  )
}

export default TypeChoice
