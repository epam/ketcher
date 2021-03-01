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

import React, { useState, useCallback } from 'react'
import { connect } from 'react-redux'
import { capitalize } from 'lodash/fp'

import { atom as atomSchema } from '../../../../../data/schema/struct-schema'
import Form, { Field } from '../../../../../component/form/form'
import { Dialog } from '../../../../components'
import element from '../../../../../../chem/element'
import ElementNumber from './ElementNumber'

import styles from './Atom.module.less'

function Atom(props) {
  const { formState, stereoParity, ...rest } = props
  const [currentLabel, setCurrentLabel] = useState(rest.label)

  const onLabelChangeCallback = useCallback(newValue => {
    setCurrentLabel(newValue)
  }, [])

  return (
    <Dialog
      title="Atom Properties"
      className={styles.atomProps}
      result={() => formState.result}
      valid={() => formState.valid}
      params={rest}>
      <Form
        schema={atomSchema}
        customValid={{
          label: l => atomValid(l),
          charge: ch => chargeValid(ch)
        }}
        init={rest}
        {...formState}>
        <fieldset className={styles.main}>
          <Field name="label" onChange={onLabelChangeCallback} />
          <Field name="alias" />
          <ElementNumber label={currentLabel} />
          <Field name="charge" maxLength="5" />
          <Field name="explicitValence" />
          <Field name="isotope" />
          <Field name="radical" />
        </fieldset>
        <fieldset className={styles.query}>
          <legend>Query specific</legend>
          <Field name="ringBondCount" />
          <Field name="hCount" />
          <Field name="substitutionCount" />
          <Field name="unsaturatedAtom" />
        </fieldset>
        <fieldset className={styles.reaction}>
          <legend>Reaction flags</legend>
          <Field name="invRet" />
          <Field name="exactChangeFlag" />
        </fieldset>
        PARITY: {stereoParity}
      </Form>
    </Dialog>
  )
}

function atomValid(label) {
  return label && !!element.map[capitalize(label)]
}

function chargeValid(charge) {
  const pch = atomSchema.properties.charge.pattern.exec(charge)
  return !(pch === null || (pch[1] !== '' && pch[3] !== ''))
}

export default connect(store => ({ formState: store.modal.form }))(Atom)
