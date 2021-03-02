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

import { useFormContext } from '../../../../../../../../hooks'
import { Field } from '../../../../../../component/form/form'

interface IfThenSelectProps {
  className: string
  label: number
  name: string
  rgids: Array<number>
}

type Props = IfThenSelectProps

const IfThenSelect = (props: Props) => {
  const { name, rgids } = props
  const { schema } = useFormContext() as any
  const desc = {
    title: schema.properties[name].title,
    enum: [0],
    enumNames: ['Always']
  }

  rgids.forEach(label => {
    if (props.label !== label) {
      desc.enum.push(label)
      desc.enumNames.push(`IF R${props.label} THEN R${label}`)
    }
  })

  return <Field schema={desc} {...props} />
}

export default IfThenSelect
