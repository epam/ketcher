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

import { BaseCallProps, BaseProps } from '../../../modal.types'

import Form, { Field } from '../../../../../component/form/form/form'
import { FC, useCallback, useState } from 'react'

import { Dialog } from '../../../../components'
import ElementNumber from './ElementNumber'
import { Elements } from 'ketcher-core'
import { atom as atomSchema } from '../../../../../data/schema/struct-schema'
import { capitalize } from 'lodash/fp'
import classes from './Atom.module.less'

interface AtomProps extends BaseProps {
  alias: string
  charge: string
  exactChangeFlag: boolean
  explicitValence: number
  hCount: number
  invRet: number
  isotope: number
  label: string
  radical: number
  ringBondCount: number
  stereoParity: number
  substitutionCount: number
  unsaturatedAtom: boolean
}

type Props = AtomProps & BaseCallProps

const Atom: FC<Props> = (props) => {
  const { formState, stereoParity, ...rest } = props
  const [currentLabel, setCurrentLabel] = useState<string>(rest.label)

  const onLabelChangeCallback = useCallback((newValue) => {
    setCurrentLabel(newValue)
  }, [])

  return (
    <Dialog
      title="Atom Properties"
      className={classes.atomProps}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}
    >
      <Form
        schema={atomSchema}
        customValid={{
          label: (label) => atomValid(label),
          charge: (charge) => chargeValid(charge)
        }}
        init={rest}
        {...formState}
      >
        <fieldset className={classes.main}>
          <Field name="label" onChange={onLabelChangeCallback} autoFocus />
          <Field name="alias" />
          <ElementNumber label={currentLabel} />
          <Field name="charge" maxLength="5" />
          <Field name="explicitValence" />
          <Field name="isotope" />
          <Field name="radical" />
        </fieldset>
        <fieldset className={classes.query}>
          <legend>Query specific</legend>
          <Field name="ringBondCount" />
          <Field name="hCount" />
          <Field name="substitutionCount" />
          <Field name="unsaturatedAtom" />
        </fieldset>
        <fieldset className={classes.reaction}>
          <legend>Reaction flags</legend>
          <Field name="invRet" />
          <Field name="exactChangeFlag" />
        </fieldset>
      </Form>
    </Dialog>
  )
}

function atomValid(label) {
  return label && !!Elements.get(capitalize(label))
}

function chargeValid(charge) {
  const result = atomSchema.properties.charge.pattern.exec(charge)
  return result && (result[1] === '' || result[3] === '')
}

export type { AtomProps }
export default Atom
