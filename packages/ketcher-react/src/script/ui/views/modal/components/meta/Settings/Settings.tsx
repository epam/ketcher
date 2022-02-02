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
import {
  setDefaultSettings,
  updateFormState
} from '../../../../../state/modal/form'

import ColorPicker from '../../../../../component/form/colorPicker/ColorPicker'
import { Dialog } from '../../../../components'
import MeasureInput from '../../../../../component/form/MeasureInput/measure-input'
import OpenButton from '../../../../../component/view/openbutton'
import SaveButton from '../../../../../component/view/savebutton'
import { StructService } from 'ketcher-core'
import SystemFonts from '../../../../../component/form/systemfonts'
import classes from './Settings.module.less'
import { connect } from 'react-redux'
import { saveSettings } from '../../../../../state/options'
import settingsSchema from '../../../../../data/schema/options-schema'
import Sidebar from './components/Sidebar'
import Icon from '../../../../../component/view/icon'
import clsx from 'clsx'
import Select from '../../../../../component/form/Select/Select'

interface SettingsProps extends BaseProps {
  initState: any
  appOpts: {
    version: string
    buildDate: string
    buildNumber: string
    indigoVersion: string
    imagoVersions: Array<string>
    server: boolean
    templates: boolean
  }
  server: StructService
}

interface SettingsCallProps extends BaseCallProps {
  onOpenFile: (any) => void
  onReset: () => void
}

type Props = SettingsProps & SettingsCallProps

const SettingsDialog = (props: Props) => {
  const {
    initState,
    formState,
    server,
    onOpenFile,
    onReset,
    appOpts,
    ...prop
  } = props

  const generalTab = {
    key: 'general',
    label: 'General',
    content: (
      <fieldset className={classes.general}>
        <Field name="resetToSelect" component={Select} />
        <Field name="rotationStep" />
        <Field name="showValenceWarnings" />
        <Field name="atomColoring" />
        <Field name="font" component={SystemFonts} />
        <Field name="fontsz" component={MeasureInput} labelPos={false} />
        <Field name="fontszsub" component={MeasureInput} labelPos={false} />
      </fieldset>
    )
  }
  const stereoTab = {
    key: 'stereo',
    label: 'Stereochemistry',
    content: (
      <fieldset className={classes.stereochemistry}>
        <Field name="showStereoFlags" />
        <Field name="stereoLabelStyle" component={Select} />
        <Field name="colorOfAbsoluteCenters" component={ColorPicker} />
        <Field name="colorOfAndCenters" component={ColorPicker} />
        <Field name="colorOfOrCenters" component={ColorPicker} />
        <Field name="colorStereogenicCenters" component={Select} />
        <Field name="autoFadeOfStereoLabels" />
        <Field name="absFlagLabel" />
        <Field name="andFlagLabel" />
        <Field name="orFlagLabel" />
        <Field name="mixedFlagLabel" />
      </fieldset>
    )
  }
  const atomsTab = {
    key: 'atoms',
    label: 'Atoms',
    content: (
      <fieldset>
        <Field name="carbonExplicitly" />
        <Field name="showCharge" />
        <Field name="showValence" />
        <Field name="showHydrogenLabels" component={Select} />
      </fieldset>
    )
  }
  const bondsTab = {
    key: 'bonds',
    label: 'Bonds',
    content: (
      <fieldset>
        <Field name="aromaticCircle" />
        <Field
          name="doubleBondWidth"
          component={MeasureInput}
          labelPos={false}
        />
        <Field name="bondThickness" component={MeasureInput} labelPos={false} />
        <Field
          name="stereoBondWidth"
          component={MeasureInput}
          labelPos={false}
        />
      </fieldset>
    )
  }
  const serverTab = {
    key: 'server',
    label: 'Server',
    content: (
      <fieldset className={classes.server} disabled={!appOpts.server}>
        <Field name="smart-layout" />
        <Field name="ignore-stereochemistry-errors" />
        <Field name="mass-skip-error-on-pseudoatoms" />
        <Field name="gross-formula-add-rsites" />
        <Field name="gross-formula-add-isotopes" />
      </fieldset>
    )
  }
  const threeDViewerTab = {
    key: '3dviewer',
    label: '3D Viewer',
    content: (
      // eslint-disable-next-line dot-notation
      <fieldset className={classes.viewer} disabled={!window['Miew']}>
        <Field name="miewMode" component={Select} />
        <Field name="miewTheme" component={Select} />
        <Field name="miewAtomLabel" component={Select} />
      </fieldset>
    )
  }
  const debuggingTab = {
    key: 'debugging',
    label: 'Options for debugging',
    content: (
      <fieldset>
        <Field name="showAtomIds" />
        <Field name="showBondIds" />
        <Field name="showHalfBondIds" />
        <Field name="showLoopIds" />
      </fieldset>
    )
  }

  const tabs = [
    generalTab,
    stereoTab,
    atomsTab,
    bondsTab,
    serverTab,
    threeDViewerTab,
    debuggingTab
  ]

  return (
    <Dialog
      title="Settings"
      className={classes.settings}
      result={() => formState.result}
      valid={() => formState.valid}
      params={prop}
      buttons={['Save']}
      buttonsTop={[
        <OpenButton
          key="settings"
          server={server}
          onLoad={onOpenFile}
          className={clsx(classes.button, classes.buttonOpen)}
        >
          <Icon name={'open-1'} />
        </OpenButton>,
        <SaveButton
          key="ketcher-settings"
          data={JSON.stringify(formState.result)}
          filename="ketcher-settings"
          className={classes.button}
        >
          <Icon name={'save-1'} />
        </SaveButton>,
        <button
          key="settings-button"
          onClick={onReset}
          className={classes.button}
        >
          <Icon name={'reset'} />
        </button>
      ]}
    >
      <Form schema={settingsSchema} init={initState} {...formState}>
        <Sidebar tabs={tabs} className={classes.sidebar} />
      </Form>
    </Dialog>
  )
}

const mapStateToProps = (state) => ({
  server: state.options.app.server ? state.server : null,
  appOpts: state.options.app,
  initState: state.options.settings,
  formState: state.modal.form
})

const mapDispatchToProps = (dispatch, ownProps) => ({
  onOpenFile: (newOpts) => {
    try {
      dispatch(updateFormState({ result: JSON.parse(newOpts) }))
    } catch (ex) {
      console.info('Bad file')
    }
  },
  onReset: () => dispatch(setDefaultSettings()),
  onOk: (res) => {
    dispatch(saveSettings(res))
    ownProps.onOk(res)
  }
})

const Settings = connect(mapStateToProps, mapDispatchToProps)(SettingsDialog)

export default Settings
