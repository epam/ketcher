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

import { Field } from '../../component/form/form/form'
import Select from '../../component/form/Select'
import { sgroupMap as schemes } from '../../data/schema/struct-schema'
import { getSelectOptionsFromSchema } from '../../utils'
import classes from './sgroup.module.less'

function SGroupFieldset({ formState }) {
  const { result } = formState

  const type = result.type

  return (
    <fieldset className={type === 'DAT' ? classes.data : 'base'}>
      {content(type)}
    </fieldset>
  )
}

const propMapping = {
  name: { maxLength: 15 },
  fieldName: { maxLength: 30 },
  fieldValue: { type: 'textarea' },
  radiobuttons: { type: 'radio' }
}

const content = (type) =>
  Object.keys(schemes[type].properties)
    .filter((prop) => prop !== 'type')
    .map((prop) => {
      if (prop === 'connectivity') {
        return (
          <Field
            name={prop}
            key={`${type}-${prop}`}
            component={Select}
            options={getSelectOptionsFromSchema(schemes[type].properties[prop])}
          />
        )
      }

      const props = propMapping[prop] || {}
      return <Field name={prop} key={`${type}-${prop}`} {...props} />
    })

export default SGroupFieldset
