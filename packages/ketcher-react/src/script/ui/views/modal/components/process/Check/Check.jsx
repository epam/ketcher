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
import { connect } from 'react-redux'

import { Dialog } from '../../../../components'
import Tabs from '../../../../../component/view/Tabs'
import Form, { Field } from '../../../../../component/form/form'
import { check } from '../../../../../state/server'
import { checkOpts } from '../../../../../state/options'
import ErrorsCheck from './components'

import style from './Check.module.less'

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

function CheckDialog(props) {
  const { formState, checkState, onCheck, ...prop } = props
  const { result = checkState, moleculeErrors } = formState
  const tabs = [
    {
      caption: 'Check',
      component: ErrorsCheck,
      props: { moleculeErrors, checkSchema }
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
      className={style.check}
      result={() => result}
      params={prop}>
      <Form schema={checkSchema} init={checkState} {...formState}>
        <Tabs
          className={style.tabs}
          captions={tabs}
          changeTab={i => (i === 0 ? onCheck(result.checkOptions) : null)}
          tabs={tabs}>
          <ErrorsCheck
            moleculeErrors={moleculeErrors}
            checkSchema={checkSchema}
          />
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

const mapStateToProps = state => ({
  formState: state.modal.form,
  checkState: state.options.check
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onCheck: opts => dispatch(check(opts)).catch(ownProps.onCancel),
  onOk: res => {
    dispatch(checkOpts(res))
    ownProps.onOk(res)
  }
})

const Check = connect(mapStateToProps, mapDispatchToProps)(CheckDialog)

export default Check
