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
import { getSelectOptionsFromSchema } from '../../utils'
import Select from '../../component/form/Select'
import { sdataCustomSchema } from '../../data/schema/sdata-schema'

function SDataFieldset({ formState }) {
  const { result } = formState
  const formSchema = sdataCustomSchema

  return (
    <fieldset className="sdata">
      <Field
        name="context"
        options={getSelectOptionsFromSchema(formSchema.properties.context)}
        component={Select}
      />
      <Field name="fieldName" placeholder="Enter name" />
      {content(
        formSchema,
        result.context,
        result.fieldName,
        result.fieldValue,
        result.radiobuttons
      )}
    </fieldset>
  )
}

const content = (schema, context, fieldName, fieldValue, checked) =>
  Object.keys(schema.properties)
    .filter(
      (prop) => prop !== 'type' && prop !== 'context' && prop !== 'fieldName'
    )
    .map((prop) => {
      return prop === 'radiobuttons' ? (
        <Field
          name={prop}
          checked={checked}
          type="radio"
          key={`${context}-${fieldName}-${prop}-radio`}
          labelPos={false}
        />
      ) : prop === 'fieldValue' ? (
        <Field
          name={prop}
          key={`${context}-${fieldName}-${prop}-select`}
          placeholder="Enter value"
        />
      ) : (
        <Field
          name={prop}
          type="textarea"
          key={`${context}-${fieldName}-${prop}-select`}
        />
      )
    })

export default SDataFieldset
