/****************************************************************************
 * Copyright 2020 EPAM Systems
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
import { connect } from 'react-redux'

import Dialog from '../../component/dialog'
import Tabs from '../../component/view/tabs'
import Form, { Field } from '../../component/form/form'
import { check } from '../../state/server'
import { checkOpts } from '../../state/options'

const checkSchema = {
  title: 'Check',
  type: 'object',
  properties: {
    checkOptions: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'valence',
          'radicals',
          'pseudoatoms',
          'stereo',
          'query',
          'overlapping_atoms',
          'overlapping_bonds',
          'rgroups',
          'chiral',
          '3d',
          'chiral_flag'
        ],
        enumNames: [
          'Valence',
          'Radical',
          'Pseudoatom',
          'Stereochemistry',
          'Query',
          'Overlapping Atoms',
          'Overlapping Bonds',
          'R-Groups',
          'Chirality',
          '3D Structure',
          'Chiral flag'
        ]
      }
    }
  }
}
function getOptionName(opt) {
  const d = checkSchema.properties.checkOptions.items
  return d.enumNames[d.enum.indexOf(opt)]
}

function Check(props) {
  const { formState, checkState, onCheck, ...prop } = props
  const { result = checkState, moleculeErrors } = formState
  const tabs = [
    {
      caption: 'Check',
      component: ErrorsCheck,
      props: { moleculeErrors }
    },
    {
      caption: 'Settings',
      component: Field,
      props: {
        name: 'checkOptions',
        multiple: true,
        type: 'checkbox',
        labelPos: false
      }
    }
  ]

  return (
    <Dialog
      title="Structure Check"
      className="check"
      result={() => result}
      params={prop}>
      <Form schema={checkSchema} init={checkState} {...formState}>
        <Tabs
          className="tabs"
          captions={tabs}
          changeTab={i => (i === 0 ? onCheck(result.checkOptions) : null)}
          tabs={tabs}>
          <ErrorsCheck moleculeErrors={moleculeErrors} />
          <Field
            name="checkOptions"
            multiple
            type="checkbox"
            labelPos={false}
          />
        </Tabs>
      </Form>
    </Dialog>
  )
}

function ErrorsCheck(props) {
  const { moleculeErrors } = props
  const moleculeErrorsTypes = Object.keys(moleculeErrors)

  return (
    <fieldset>
      {moleculeErrorsTypes.length === 0 ? (
        <dt>No errors found</dt>
      ) : (
        moleculeErrorsTypes.map(type => (
          <div>
            <dt>{getOptionName(type)} warning:</dt>
            <dd>{moleculeErrors[type]}</dd>
          </div>
        ))
      )}
    </fieldset>
  )
}

export default connect(
  store => ({
    formState: store.modal.form,
    checkState: store.options.check
  }),
  (dispatch, props) => ({
    onCheck: opts => dispatch(check(opts)).catch(props.onCancel),
    onOk: res => {
      dispatch(checkOpts(res))
      props.onOk(res)
    }
  })
)(Check)
