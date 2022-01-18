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

import Form, { Field } from '../../../component/form/form/form'

import ButtonList from '../../../component/form/buttonlist'
import { Dialog } from '../../../views/components'
import classes from './rgroup.module.less'
import { connect } from 'react-redux'
import { rgroupSchema } from '../../../data/schema/struct-schema'

function RGroup({ disabledIds, values, formState, type, ...props }) {
  return (
    <Dialog
      title="R-Group"
      className={classes.rgroup}
      params={props}
      result={() => formState.result}
    >
      <Form schema={rgroupSchema} init={{ values }} {...formState}>
        <Field
          name="values"
          multiple={type === 'atom'}
          labelPos={false}
          component={ButtonList}
          disabledIds={disabledIds}
          classes={classes}
        />
      </Form>
    </Dialog>
  )
}

export default connect((store) => ({ formState: store.modal.form }))(RGroup)
