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

import * as structFormat from '../../../../../data/convert/structConverter'

import Form, { Field } from '../../../../../component/form/form/form'
import {
  FormatterFactory,
  formatProperties,
  getPropertiesByFormat
} from 'ketcher-core'
import { Component, createRef } from 'react'

import { Dialog } from '../../../../components'
import { ErrorsContext } from '../../../../../../../contexts'
import SaveButton from '../../../../../component/view/savebutton'
import SaveImageTab from './SaveImageTab'
import Tabs from '../../../../../component/view/Tabs'
import { check } from '../../../../../state/server'
import classes from './Save.module.less'
import { connect } from 'react-redux'
import { saveUserTmpl } from '../../../../../state/templates'
import { updateFormState } from '../../../../../state/modal/form'

const saveSchema = {
  title: 'Save',
  type: 'object',
  properties: {
    filename: {
      title: 'Filename',
      type: 'string',
      maxLength: 128,
      pattern: /^[^.<>:?"*|/\\][^<>:?"*|/\\]*$/,
      invalidMessage: res => {
        if (!res) return 'Filename should contain at least one character'
        if (res.length > 128) return 'Filename is too long'
        return "A filename cannot contain characters: \\ / : * ? \" < > | and cannot start with '.'"
      }
    },
    format: {
      title: 'Format',
      enum: Object.keys(formatProperties),
      enumNames: Object.keys(formatProperties).map(
        format => formatProperties[format].name
      )
    }
  }
}

class SaveDialog extends Component {
  static contextType = ErrorsContext
  constructor(props) {
    super(props)
    this.state = {
      disableControls: true,
      imageFormat: 'svg',
      tabIndex: 0
    }
    this.isRxn = this.props.struct.hasRxnArrow()
    this.textAreaRef = createRef()
    const formats = [this.isRxn ? 'rxn' : 'mol', 'smiles', 'graph']
    if (this.props.server)
      formats.push(
        this.isRxn ? 'rxnV3000' : 'molV3000',
        'smilesExt',
        'smarts',
        'inChI',
        'inChIAuxInfo',
        'cml'
      )

    this.saveSchema = saveSchema
    this.saveSchema.properties.format = Object.assign(
      this.saveSchema.properties.format,
      {
        enum: formats,
        enumNames: formats.map(format => getPropertiesByFormat(format).name)
      }
    )
  }

  componentDidMount() {
    const { checkOptions } = this.props.checkState
    this.props.onCheck(checkOptions)
    this.changeType(this.isRxn ? 'rxn' : 'mol').then(
      res => res instanceof Error && this.setState({ disableControls: true })
    )
  }

  showStructWarningMessage = format => {
    const { errors } = this.props.formState
    return format !== 'mol' && Object.keys(errors).length > 0
  }

  changeType = type => {
    const errorHandler = this.context.errorHandler
    this.setState({ disableControls: true })

    const { struct, server, options, formState } = this.props

    const factory = new FormatterFactory(server)

    const service = factory.create(type, options)

    return service
      .getStructureFromStructAsync(struct)
      .then(
        structStr => {
          this.setState({ structStr })
          setTimeout(() => {
            if (this.textAreaRef.current) {
              this.textAreaRef.current.select()
            }
          }, 10) // TODO: remove hack
        },
        e => {
          errorHandler(e.message)
          this.props.onResetForm(formState)
          return e
        }
      )
      .finally(() => {
        this.setState({ disableControls: false })
      })
  }

  getWarnings = format => {
    const { struct, moleculeErrors } = this.props
    const warnings = []
    const structWarning =
      'Structure contains errors, please check the data, otherwise you ' +
      'can lose some properties or the whole structure after saving in this format.'
    const saveWarning = structFormat.couldBeSaved(struct, format)
    const isStructInvalid = this.showStructWarningMessage(format)

    if (isStructInvalid) {
      warnings.push(structWarning)
    }
    if (saveWarning) {
      warnings.push(saveWarning)
    }

    if (moleculeErrors) {
      warnings.push(...Object.values(moleculeErrors))
    }
    return warnings
  }

  changeTab = tabIndex => {
    this.setState({ tabIndex })
  }

  changeImageFormat = imageFormat => {
    this.setState({ imageFormat })
  }

  renderSaveFile = () => {
    const formState = Object.assign({}, this.props.formState)
    delete formState.moleculeErrors
    const { filename, format } = formState.result
    const warnings = this.getWarnings(format)
    const { structStr } = this.state
    return (
      <div className={classes.formContainer}>
        <Form
          schema={this.saveSchema}
          init={{
            filename,
            format: this.isRxn ? 'rxn' : 'mol'
          }}
          {...formState}>
          <Field name="filename" />
          <Field name="format" onChange={this.changeType} />
        </Form>
        <textarea
          value={structStr}
          className={classes.saveTextarea}
          readOnly
          ref={this.textAreaRef}
        />
        {warnings.length ? (
          <div className={classes.warnings}>
            {warnings.map(warning => (
              <div className={classes.warningsContainer}>
                <div className={classes.warning} />
                <div className={classes.warningsArr}>{warning}</div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  getButtons = () => {
    const { disableControls, imageFormat, structStr, tabIndex } = this.state
    const formState = this.props.formState
    const { filename, format } = formState.result
    const isCleanStruct = this.props.struct.isBlank()
    const buttons = [
      [
        <SaveButton
          mode="saveFile"
          data={structStr}
          filename={filename + getPropertiesByFormat(format).extensions[0]}
          key="save-file-button"
          type={format.mime}
          server={this.props.server}
          onSave={this.props.onOk}
          disabled={disableControls || !formState.valid || isCleanStruct}>
          Save To File
        </SaveButton>,
        <button
          key="save-tmpl"
          className={classes.saveTmpl}
          disabled={disableControls || isCleanStruct}
          onClick={() => this.props.onTmplSave(this.props.struct)}>
          Save to Templates...
        </button>,
        'Close'
      ],
      [
        <SaveButton
          mode="saveImage"
          data={structStr}
          filename={filename}
          outputFormat={imageFormat}
          key="save-image-button"
          type="image/svg+xml"
          onSave={this.props.onOk}
          disabled={
            disableControls ||
            !formState.valid ||
            isCleanStruct ||
            !this.props.server
          }>
          Save As Image
        </SaveButton>,
        'Close'
      ]
    ]
    return buttons[tabIndex]
  }

  render() {
    const tabs = [
      {
        caption: 'Structure',
        component: this.renderSaveFile
      },
      {
        caption: 'Image',
        component: SaveImageTab,
        props: {
          changeImageFormat: this.changeImageFormat
        }
      }
    ]

    return (
      <Dialog
        title="Save Structure"
        className={classes.save}
        params={this.props}
        buttons={this.getButtons()}>
        <Tabs
          tabs={tabs}
          changeTab={tab => {
            this.changeTab(tab)
          }}
        />
      </Dialog>
    )
  }
}

const mapStateToProps = state => ({
  server: state.options.app.server ? state.server : null,
  struct: state.editor.struct(),
  options: state.options.getServerSettings(),
  formState: state.modal.form,
  moleculeErrors: state.modal.form.moleculeErrors,
  checkState: state.options.check
})

const mapDispatchToProps = dispatch => ({
  onCheck: checkOptions => dispatch(check(checkOptions)),
  onTmplSave: struct => dispatch(saveUserTmpl(struct)),
  onResetForm: prevState => dispatch(updateFormState(prevState))
})

const Save = connect(mapStateToProps, mapDispatchToProps)(SaveDialog)

export default Save
