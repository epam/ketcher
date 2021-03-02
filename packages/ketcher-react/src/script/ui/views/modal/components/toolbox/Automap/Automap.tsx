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

import Form, { Field } from '../../../../../component/form/form'
import { Dialog } from '../../../../components'

import styles from './Automap.module.less'

interface AutomapProps {
  className: string
  formState: any
}

interface AutomapCallProps {
  onCancel: () => void
  onOk: (result: any) => void
}

type Props = AutomapProps & AutomapCallProps

export const automapSchema = {
  title: 'Reaction Auto-Mapping',
  type: 'object',
  required: ['mode'],
  properties: {
    mode: {
      title: 'Mode',
      enum: ['discard', 'keep', 'alter', 'clear'],
      enumNames: ['Discard', 'Keep', 'Alter', 'Clear'],
      default: 'discard'
    }
  }
}

const Automap = (props: Props) => {
  const { formState, ...rest } = props
  return (
    <Dialog
      title="Reaction Auto-Mapping"
      className={styles.automap}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}>
      <Form schema={automapSchema} {...formState}>
        <Field name="mode" />
      </Form>
    </Dialog>
  )
}

export type { AutomapProps, AutomapCallProps }
export default Automap
