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

import { rgroupLogic as rgroupSchema } from '../../../../../data/schema/struct-schema'
import Form, { Field } from '../../../../../component/form/form'
import { Dialog } from '../../../../components'
import IfThenSelect from './components'

import styles from './RgroupLogic.module.less'

interface RgroupLogicProps {
  className: string
  formState: any
  frags: Set<number>
  ifthen: number
  label: number
  range: string
  resth: boolean
  rgroupLabels: Array<number>
}

interface RgroupLogicCallProps {
  onCancel: () => void
  onOk: (result: any) => void
}

type Props = RgroupLogicProps & RgroupLogicCallProps

const RgroupLogic = (props: Props) => {
  const { formState, label, rgroupLabels, ...rest } = props
  return (
    <Dialog
      title="R-Group Logic"
      className={styles.rgroupLogic}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}>
      <Form
        schema={rgroupSchema}
        customValid={{ range: r => rangeConv(r) }}
        init={rest}
        {...formState}>
        <Field name="range" />
        <Field name="resth" />
        <IfThenSelect
          name="ifthen"
          className={styles.cond}
          label={label}
          rgids={rgroupLabels}
        />
      </Form>
    </Dialog>
  )
}

function rangeConv(range) {
  // structConv
  const res = range
    .replace(/\s*/g, '')
    .replace(/,+/g, ',')
    .replace(/^,/, '')
    .replace(/,$/, '')

  return res
    .split(',')
    .every(s => s.match(/^[>,<=]?[0-9]+$/g) || s.match(/^[0-9]+-[0-9]+$/g))
}

export type { RgroupLogicProps }
export default RgroupLogic
