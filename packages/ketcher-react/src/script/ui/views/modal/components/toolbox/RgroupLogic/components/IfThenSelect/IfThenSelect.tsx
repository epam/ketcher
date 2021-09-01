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

import { useFormContext } from '../../../../../../../../../hooks'
import { Field } from '../../../../../../../component/form/form/form'
import { RgroupLogicProps } from '../../RgroupLogic'

import classes from './IfThenSelect.module.less'

type Props = Pick<RgroupLogicProps, 'label' | 'rgroupLabels'>

const IfThenSelect = (props: Props) => {
  const PROP_NAME = 'ifthen'
  const { rgroupLabels, label } = props
  const { schema } = useFormContext() as any
  const desc = {
    title: schema.properties[PROP_NAME].title,
    enum: [0],
    enumNames: ['Always']
  }

  rgroupLabels.forEach(rgroupLabel => {
    if (label !== rgroupLabel) {
      desc.enum.push(rgroupLabel)
      desc.enumNames.push(`IF R${label} THEN R${rgroupLabel}`)
    }
  })

  return <Field schema={desc} className={classes.field} {...props} />
}

export default IfThenSelect
