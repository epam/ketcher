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

import Form, { Field } from '../../component/form/form/form'
import {
  getSdataDefault,
  sdataCustomSchema
} from '../../data/schema/sdata-schema'
import { getSelectOptionsFromSchema } from '../../utils'

import { Dialog } from '../../views/components'
import Select from '../../component/form/Select'
import classes from './sgroup.module.less'
import { connect } from 'react-redux'

function SData({
  context,
  fieldName,
  fieldValue,
  type,
  radiobuttons,
  formState,
  ...prop
}) {
  const { result, valid } = formState

  const formSchema = sdataCustomSchema

  const init = {
    context: context || getSdataDefault(formSchema, 'context'),
    fieldName: fieldName || getSdataDefault(formSchema, 'fieldName'),
    type,
    radiobuttons: radiobuttons || getSdataDefault(formSchema, 'radiobuttons')
  }

  init.fieldValue = fieldValue || getSdataDefault(formSchema, 'fieldValue')

  const serialize = {
    context: result.context.trim(),
    fieldName: result.fieldName.trim(),
    fieldValue:
      typeof result.fieldValue === 'string'
        ? result.fieldValue.trim()
        : result.fieldValue
  }

  return (
    <Dialog
      title="S-Group Properties"
      className={classes.sgroup}
      result={() => result}
      valid={() => valid}
      buttons={['Cancel', 'OK']}
      buttonsNameMap={{ OK: 'Apply' }}
      withDivider={true}
      needMargin={false}
      params={prop}
    >
      <Form
        serialize={serialize}
        schema={formSchema}
        init={init}
        {...formState}
      >
        <fieldset>
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
            radiobuttons
          )}
        </fieldset>
      </Form>
    </Dialog>
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

export default connect((store) => ({ formState: store.modal.form }))(SData)
