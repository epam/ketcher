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

import Form, { Field, SelectOneOf } from '../../component/form/form/form'

import { Dialog } from '../../views/components'
import classes from './sgroup.module.less'
import { connect } from 'react-redux'
import { sgroupMap as schemes } from '../../data/schema/struct-schema'
import Select from '../../component/form/Select'
import { getSelectOptionsFromSchema } from '../../utils'

function Sgroup({ formState, ...prop }) {
  const { result, valid } = formState

  const type = result.type

  return (
    <Dialog
      title="S-Group Properties"
      className={classes.sgroup}
      result={() => result}
      valid={() => valid}
      params={prop}
    >
      <Form schema={schemes[type]} init={prop} {...formState}>
        <SelectOneOf title="Type" name="type" schema={schemes} />
        {type !== 'GEN' && (
          <fieldset className={type === 'DAT' ? classes.data : 'base'}>
            {content(type)}
          </fieldset>
        )}
      </Form>
    </Dialog>
  )
}

const content = (type) =>
  Object.keys(schemes[type].properties)
    .filter((prop) => prop !== 'type')
    .map((prop) => {
      const props = {}
      if (prop === 'name') props.maxLength = 15
      if (prop === 'fieldName') props.maxLength = 30
      if (prop === 'fieldValue') props.type = 'textarea'
      if (prop === 'radiobuttons') props.type = 'radio'
      if (prop === 'connectivity')
        return (
          <Field
            name={prop}
            key={`${type}-${prop}`}
            {...props}
            component={Select}
            options={getSelectOptionsFromSchema(schemes[type].properties[prop])}
          />
        )

      return <Field name={prop} key={`${type}-${prop}`} {...props} />
    })

export default connect((store) => ({ formState: store.modal.form }))(Sgroup)
