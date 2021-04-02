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

import React, { Component, createRef } from 'react'
import { connect } from 'react-redux'
import {
  FormatterFactory,
  getPropertiesByFormat,
  formatProperties
} from 'ketcher-core'

import { molfileManager } from '../../../../../../chem/molfile'
import smilesManager from '../../../../../../chem/smiles'
import graphManager from '../../../../../../format/chemGraph'
import * as structFormat from '../../../../../data/convert/structConverter'
import { saveUserTmpl } from '../../../../../state/templates'
import { updateFormState } from '../../../../../state/modal/form'
import { check } from '../../../../../state/server'
import { Dialog } from '../../../../components'
import Form, { Field } from '../../../../../component/form/form'
import SaveButton from '../../../../../component/view/savebutton'

import classes from './Save.module.less'

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
  constructor(props) {
    super(props)
    this.state = {}
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

    this.changeType(this.isRxn ? 'rxn' : 'mol').then(res =>
      res instanceof Error ? props.onCancel() : null
    )
  }

  componentDidMount() {
    const { checkOptions } = this.props.checkState
    this.props.onCheck(checkOptions)
  }

  showStructWarningMessage = format => {
    const { errors } = this.props.formState
    return format !== 'mol' && Object.keys(errors).length > 0
  }

  changeType = type => {
    const { struct, server, options, formState } = this.props

    const factory = new FormatterFactory(
      server,
      graphManager,
      molfileManager,
      smilesManager
    )

    const service = factory.create(type, options)

    return service.getStructureFromStructAsync(struct).then(
      structStr => {
        this.setState({ structStr })
        setTimeout(() => {
          if (this.textAreaRef.current) {
            this.textAreaRef.current.select()
          }
        }, 10) // TODO: remove hack
      },
      e => {
        //TODO: add error handler call
        alert(e.message)
        this.props.onResetForm(formState)
        return e
      }
    )
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
    if (struct.rxnArrows.size > 1 && format !== 'graph') {
      warnings.push(
        `The ${
          getPropertiesByFormat(format).name
        } format does not support drawn elements: reaction arrows will be lost.`
      )
    }
    if (moleculeErrors) {
      warnings.push(...Object.values(moleculeErrors))
    }
    return warnings
  }

  render() {
    const { structStr } = this.state
    const formState = Object.assign({}, this.props.formState)
    delete formState.moleculeErrors
    const { filename, format } = formState.result
    const warnings = this.getWarnings(format)
    const isCleanStruct = this.props.struct.isBlank()

    return (
      <Dialog
        title="Save Structure"
        className={classes.save}
        params={this.props}
        buttons={[
          <SaveButton
            mode="saveFile"
            data={structStr}
            filename={filename + getPropertiesByFormat(format).extensions[0]}
            key="save-file-button"
            type={format.mime}
            server={this.props.server}
            onSave={() => this.props.onOk()}
            disabled={!formState.valid || isCleanStruct}>
            Save To File…
          </SaveButton>,
          <SaveButton
            mode="saveImage"
            data={structStr}
            filename={filename}
            key="save-image-button"
            type="image/svg+xml"
            server={this.props.server}
            onSave={this.props.onOk}
            disabled={!formState.valid || isCleanStruct}>
            Save As Image...
          </SaveButton>,
          <button
            key="save-tmpl"
            disabled={isCleanStruct}
            onClick={() => this.props.onTmplSave(this.props.struct)}>
            Save to Templates
          </button>,
          'Close'
        ]}>
        <div className={classes.form_container}>
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
          <textarea value={structStr} readOnly ref={this.textAreaRef} />
          {warnings.map(warning => (
            <div className={classes.warnings_container}>
              <div className={classes.warning} />
              <div className={classes.warnings_arr}>{warning}</div>
            </div>
          ))}
        </div>
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
