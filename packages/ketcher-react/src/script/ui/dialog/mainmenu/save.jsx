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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  FormatterFactory,
  getPropertiesByFormat,
  formatProperties
} from 'ketcher-core'
import { molfileManager } from '../../../chem/molfile'
import smilesManager from '../../../chem/smiles'
import graphManager from '../../../format/chemGraph'
import * as structFormat from '../../data/convert/structConverter'
import { saveUserTmpl } from '../../state/templates'
import { updateFormState } from '../../state/modal/form'
import { check } from '../../state/server'
import Dialog from '../../component/dialog'
import Form, { Field } from '../../component/form/form'
import SaveButton from '../../component/view/savebutton'
import { createRef } from 'react'

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

class Save extends Component {
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

  showStructWarningMessage(format) {
    const { errors } = this.props.formState
    return format !== 'mol' && Object.keys(errors).length > 0
  }

  changeType(type) {
    const { struct, server, options, formState } = this.props

    const factory = new FormatterFactory(
      {
        struct: () => struct
      },
      server,
      graphManager,
      molfileManager,
      smilesManager
    )

    const service = factory.create(type, options)

    return service.getStructureAsync().then(
      structStr => {
        this.setState({ structStr })
        setTimeout(() => this.textAreaRef.current.select(), 10) // TODO: remove hack
      },
      e => {
        //TODO: add error handler call
        alert(e.message)
        this.props.onResetForm(formState)
        return e
      }
    )
  }

  getWarnings(format) {
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
        className="save"
        params={this.props}
        buttons={[
          <SaveButton
            data={structStr}
            filename={filename + getPropertiesByFormat(format).ext[0]}
            key="save-button"
            type={format.mime}
            server={this.props.server}
            onSave={() => this.props.onOk()}
            disabled={!formState.valid || isCleanStruct}>
            Save To File…
          </SaveButton>,
          <button
            key="save-tmpl"
            className="save-tmpl"
            disabled={isCleanStruct}
            onClick={() => this.props.onTmplSave(this.props.struct)}>
            Save to Templates
          </button>,
          'Close'
        ]}>
        <div className="form-container">
          <Form
            schema={this.saveSchema}
            init={{
              filename,
              format: this.isRxn ? 'rxn' : 'mol'
            }}
            {...formState}>
            <Field name="filename" />
            <Field name="format" onChange={value => this.changeType(value)} />
          </Form>
          <textarea value={structStr} readOnly ref={this.textAreaRef} />
          {warnings.map(warning => (
            <div className="warnings-container">
              <div className="warning" />
              <div className="warnings-arr">{warning}</div>
            </div>
          ))}
        </div>
      </Dialog>
    )
  }
}

export default connect(
  store => ({
    server: store.options.app.server ? store.server : null,
    struct: store.editor.struct(),
    options: store.options.getServerSettings(),
    formState: store.modal.form,
    moleculeErrors: store.modal.form.moleculeErrors,
    checkState: store.options.check
  }),
  dispatch => ({
    onCheck: checkOptions => dispatch(check(checkOptions)),
    onTmplSave: struct => dispatch(saveUserTmpl(struct)),
    onResetForm: prevState => dispatch(updateFormState(prevState))
  })
)(Save)
