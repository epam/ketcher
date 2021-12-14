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

import Form, { Field } from '../../../../../component/form/form/form'

import { Dialog } from '../../../../components'
import ErrorsCheck from './components'
import { check } from '../../../../../state/server'
import { checkOpts } from '../../../../../state/options'
import { connect } from 'react-redux'
import style from './Check.module.less'
import { useEffect } from 'react'

const checkSchema = {
  title: 'Check',
  type: 'object',
  properties: {
    checkOptions: {
      title: 'Settings',
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

  useEffect(() => {
    onCheck(result.checkOptions)
  }, [])

  return (
    <Dialog
      title="Structure Check"
      className={style.check}
      params={prop}
      buttons={[]}
    >
      <Form
        schema={checkSchema}
        init={checkState}
        {...formState}
        result={result}
      >
        <div className={style.wrapper}>
          <div className={style.settings}>
            <label>Settings</label>
            <Field
              name="checkOptions"
              labelPos={false}
              multiple
              type="checkbox"
              onChange={onCheck}
            />
          </div>
          <div className={style.warnings}>
            <ErrorsCheck
              moleculeErrors={moleculeErrors}
              checkSchema={checkSchema}
            />
          </div>
        </div>
      </Form>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  formState: state.modal.form,
  checkState: state.options.check
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onCheck: (opts) => dispatch(check(opts)).catch(ownProps.onCancel),
  onOk: (res) => {
    dispatch(checkOpts(res))
    ownProps.onOk(res)
  }
})

const Check = connect(mapStateToProps, mapDispatchToProps)(CheckDialog)

export default Check
