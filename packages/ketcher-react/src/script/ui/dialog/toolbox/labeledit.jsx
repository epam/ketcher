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

import { Dialog } from '../../views/components'
import { Elements } from 'ketcher-core'
import { capitalize } from 'lodash/fp'
import { connect } from 'react-redux'
import { labelEdit as labelEditSchema } from '../../data/schema/struct-schema'
import styles from './labelEdit.module.less'

function serialize(lc) {
  const charge = Math.abs(lc.charge)
  const radical = ['', ':', '.', '^^'][lc.radical] || ''
  let sign = ''
  if (charge) sign = lc.charge < 0 ? '-' : '+'
  return (
    (lc.isotope || '') + lc.label + radical + (charge > 1 ? charge : '') + sign
  )
}

function deserialize(value) {
  const match = value.match(/^(\d+)?([a-z*]{1,3})(\.|:|\^\^)?(\d+[-+]|[-+])?$/i) // TODO: radical on last place
  if (match) {
    const label = match[2] === '*' ? 'A' : capitalize(match[2])
    let charge = 0
    let isotope = 0
    let radical = 0

    if (match[1]) isotope = parseInt(match[1])

    if (match[3]) radical = { ':': 1, '.': 2, '^^': 3 }[match[3]]

    if (match[4]) {
      charge = parseInt(match[4])
      if (isNaN(charge))
        // eslint-disable-line
        charge = 1
      if (match[4].endsWith('-')) charge = -charge
    }
    // Not consistant
    if (
      label === 'A' ||
      label === 'Q' ||
      label === 'X' ||
      label === 'M' ||
      Elements.get(label)
    )
      return { label, charge, isotope, radical }
  }
  return null
}

function LabelEdit(props) {
  const init = { label: props.letter || serialize(props) }
  const { formState, ...prop } = props
  const { result, valid } = formState

  return (
    <Dialog
      title="Label Edit"
      valid={() => valid}
      withDivider={true}
      result={() => deserialize(result.label)}
      className={styles.labelEdit}
      buttons={['OK']}
      buttonsNameMap={{ OK: 'Apply' }}
      focusable={false}
      params={prop}
    >
      <Form
        schema={labelEditSchema}
        customValid={{ label: (l) => deserialize(l) }}
        init={init}
        {...formState}
      >
        <Field
          name="label"
          maxLength="20"
          size="10"
          autoFocus
          className={styles.labelEditInputField}
        />
      </Form>
    </Dialog>
  )
}

export default connect((store) => ({ formState: store.modal.form }))(LabelEdit)
