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
import {
  updateFormState,
  setDefaultSettings
} from '../../../../../state/modal/form'
import { saveSettings } from '../../../../../state/options'

import settingsSchema from '../../../../../data/schema/options-schema'
import { storage } from '../../../../../storage-ext'

import Form, { Field } from '../../../../../component/form/form'
import { Dialog } from '../../../../components'
import Accordion from './components/Accordion'
import SaveButton from '../../../../../component/view/savebutton'
import OpenButton from '../../../../../component/view/openbutton'

import MeasureInput from '../../../../../component/form/measure-input'
import SystemFonts from '../../../../../component/form/systemfonts'
import SelectCheckbox from '../../../../../component/form/select-checkbox'

import classes from './Settings.module.less'

function SettingsDialog(props) {
  const {
    initState,
    formState,
    server,
    onOpenFile,
    onReset,
    appOpts,
    ...prop
  } = props

  return (
    <Dialog
      title="Settings"
      className={classes.settings}
      result={() => formState.result}
      valid={() => formState.valid}
      params={prop}
      buttons={[
        <OpenButton key="settings" server={server} onLoad={onOpenFile}>
          Open From File…
        </OpenButton>,
        <SaveButton
          key="ketcher-settings"
          data={JSON.stringify(formState.result)}
          filename="ketcher-settings">
          Save To File…
        </SaveButton>,
        <button key="settings-button" onClick={onReset}>
          Reset
        </button>,
        'Cancel',
        'OK'
      ]}>
      <Form schema={settingsSchema} init={initState} {...formState}>
        <Accordion className={classes.accordion} multiple={false} active={[0]}>
          <Accordion.Group caption="Rendering customization options">
            <fieldset className={classes.render}>
              <Field name="resetToSelect" />
              <Field name="rotationStep" />
              <Field name="showValenceWarnings" component={SelectCheckbox} />
              <Field name="atomColoring" component={SelectCheckbox} />
              <Field name="hideStereoFlags" component={SelectCheckbox} />
              <Field name="font" component={SystemFonts} />
              <Field name="fontsz" component={MeasureInput} />
              <Field name="fontszsub" component={MeasureInput} />
            </fieldset>
          </Accordion.Group>
          <Accordion.Group caption="Atoms">
            <fieldset>
              <Field name="carbonExplicitly" component={SelectCheckbox} />
              <Field name="showCharge" component={SelectCheckbox} />
              <Field name="showValence" component={SelectCheckbox} />
              <Field name="showHydrogenLabels" component={SelectCheckbox} />
            </fieldset>
          </Accordion.Group>
          <Accordion.Group caption="Bonds">
            <fieldset>
              <Field name="aromaticCircle" component={SelectCheckbox} />
              <Field name="doubleBondWidth" component={MeasureInput} />
              <Field name="bondThickness" component={MeasureInput} />
              <Field name="stereoBondWidth" component={MeasureInput} />
            </fieldset>
          </Accordion.Group>
          <Accordion.Group caption="Server">
            <fieldset className={classes.server} disabled={!appOpts.server}>
              <Field name="smart-layout" component={SelectCheckbox} />
              <Field
                name="ignore-stereochemistry-errors"
                component={SelectCheckbox}
              />
              <Field
                name="mass-skip-error-on-pseudoatoms"
                component={SelectCheckbox}
              />
              <Field
                name="gross-formula-add-rsites"
                component={SelectCheckbox}
              />
              <Field
                name="gross-formula-add-isotopes"
                component={SelectCheckbox}
              />
            </fieldset>
          </Accordion.Group>
          <Accordion.Group caption="3D Viewer">
            <fieldset className={classes.viewer} disabled={!window.Miew}>
              <Field name="miewMode" />
              <Field name="miewTheme" />
              <Field name="miewAtomLabel" />
            </fieldset>
          </Accordion.Group>
          <Accordion.Group caption="Options for debugging">
            <fieldset>
              <Field name="showAtomIds" component={SelectCheckbox} />
              <Field name="showBondIds" component={SelectCheckbox} />
              <Field name="showHalfBondIds" component={SelectCheckbox} />
              <Field name="showLoopIds" component={SelectCheckbox} />
            </fieldset>
          </Accordion.Group>
        </Accordion>
        {!storage.isAvailable() ? (
          <div className={classes.warning}>{storage.warningMessage}</div>
        ) : null}
      </Form>
    </Dialog>
  )
}

const mapStateToProps = state => ({
  server: state.options.app.server ? state.server : null,
  appOpts: state.options.app,
  initState: state.options.settings,
  formState: state.modal.form
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenFile: newOpts => {
    try {
      dispatch(updateFormState({ result: JSON.parse(newOpts) }))
    } catch (ex) {
      console.info('Bad file')
    }
  },
  onReset: () => dispatch(setDefaultSettings()),
  onOk: res => {
    dispatch(saveSettings(res))
    ownProps.onOk(res)
  }
})

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsDialog)

export default Settings
