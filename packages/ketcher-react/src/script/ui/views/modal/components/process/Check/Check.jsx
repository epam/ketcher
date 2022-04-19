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
import { useEffect, useState } from 'react'
import { LoadingCircles } from 'src/script/ui/views/modal/components/document/Open/components/LoadingCircles'

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

const getFormattedDateString = (date) => {
  const getFixedString = (num) => (num + '').padStart(2, 0)
  return `${getFixedString(date.getHours())}:${getFixedString(
    date.getMinutes()
  )}:${getFixedString(date.getSeconds())}  ${getFixedString(
    date.getDate()
  )}.${getFixedString(date.getMonth() + 1)}.${getFixedString(
    date.getFullYear()
  )}`
}

function CheckDialog(props) {
  const { formState, checkState, onCheck, onApply, onCancel, ...restProps } =
    props
  const { result = checkState, moleculeErrors } = formState
  const [isStuctureChecking, setIsStructureChecking] = useState(false)
  const [lastCheckDate, setLastCheckDate] = useState(null)
  const [isCheckedWithNewSettings, setIsCheckedWithNewSettings] =
    useState(false)

  const handleApply = () => onApply(result)

  const handleCheck = () => {
    setIsStructureChecking(false)
    onCheck(result.checkOptions).then(() => {
      setIsStructureChecking(true)
      setLastCheckDate(new Date())
      setIsCheckedWithNewSettings(true)
    })
  }

  const handleSettingsChange = () => setIsCheckedWithNewSettings(false)

  useEffect(() => {
    handleCheck()
  }, [])

  return (
    <Dialog
      title="Structure Check"
      className={style.dialog_body}
      params={{ ...restProps, onCancel }}
      buttons={[]}
      withDivider
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
            <div
              className={!isStuctureChecking ? style.checkBoxesDisabled : ''}
            >
              <Field
                name="checkOptions"
                labelPos={false}
                multiple
                type="checkbox"
                disabled={!isStuctureChecking}
                onChange={handleSettingsChange}
              />
            </div>
          </div>
          <div className={style.checkInfo}>
            <span>
              Last check:{' '}
              {lastCheckDate && getFormattedDateString(lastCheckDate)}
            </span>
            <div
              className={
                !Object.keys(moleculeErrors).length || !isStuctureChecking
                  ? style.centeredContainer
                  : style.warnings
              }
            >
              {isStuctureChecking ? (
                <div
                  className={
                    Object.keys(moleculeErrors).length
                      ? style.warningsContainer
                      : style.centeredContainer
                  }
                >
                  <ErrorsCheck
                    moleculeErrors={moleculeErrors}
                    checkSchema={checkSchema}
                  />
                </div>
              ) : (
                <LoadingCircles />
              )}
            </div>
          </div>
        </div>
      </Form>
      <div className={style.buttons}>
        <div>
          <button
            className={
              isCheckedWithNewSettings
                ? style.buttonSecondary
                : style.buttonPrimary
            }
            onClick={handleCheck}
            disabled={!isStuctureChecking}
          >
            Check
          </button>
        </div>
        <div className={style.buttonsRight}>
          <button className={style.buttonSecondary} onClick={onCancel}>
            Cancel
          </button>
          <button
            className={style.buttonPrimary}
            onClick={handleApply}
            disabled={!isStuctureChecking}
          >
            Apply
          </button>
        </div>
      </div>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  formState: state.modal.form,
  checkState: state.options.check
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onCheck: (opts) => dispatch(check(opts)).catch(ownProps.onCancel),
  onApply: (res) => {
    dispatch(checkOpts(res))
    ownProps.onOk(res)
  }
})

const Check = connect(mapStateToProps, mapDispatchToProps)(CheckDialog)

export default Check
