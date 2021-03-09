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

import { bond as bondSchema } from '../../../../../data/schema/struct-schema'
import Form, { Field } from '../../../../../component/form/form'
import { Dialog } from '../../../../components'
import { BaseProps, BaseCallProps } from '../../../modal.types'

import classes from './Bond.module.less'

interface BondProps extends BaseProps {
  center: number
  topology: number
  type: string
}

type Props = BondProps & BaseCallProps

const Bond = (props: Props) => {
  const { formState, ...rest } = props
  return (
    <Dialog
      title="Bond Properties"
      className={classes.bond}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}>
      <Form schema={bondSchema} init={rest} {...formState}>
        <Field name="type" />
        <Field name="topology" />
        <Field name="center" />
      </Form>
    </Dialog>
  )
}

export type { BondProps }
export default Bond
