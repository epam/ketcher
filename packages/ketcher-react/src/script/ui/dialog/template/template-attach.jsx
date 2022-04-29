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

import { Dialog, StructEditor } from '../../views/components'
import { Component } from 'react'
import { initAttach, setAttachPoints, setTmplName } from '../../state/templates'

import { connect } from 'react-redux'
import { storage } from '../../storage-ext'
import Form, { Field } from '../../component/form/form/form'
import { attachSchema } from '../../data/schema/struct-schema'
import styled from '@emotion/styled'
import classes from './template-lib.module.less'
import { css } from '@emotion/react'
import { Button } from '@mui/material'

// @TODO When theming is implemented, use theme wherever possible
const TemplateEditDialog = styled(Dialog)`
  background-color: #fff;

  // Overriding margins set in Dialog.module.less
  & > div {
    margin: 0;
  }

  & header {
    text-transform: none;
    border-bottom: 1px solid #e1e5ea;
    margin: 0;
    padding: 12px;
  }

  & form {
    display: flex;
  }
`

const Editor = styled('div')`
  border: 1px solid #b4b9d6;
  background-color: #ffff;
  border-radius: 5px;
  position: relative;
  height: 300px;
  width: 330px;
  overflow: hidden;

  & .structEditor {
    height: 100%;
    width: 100%;
    border: none;
  }
`

const Warning = styled('div')`
  padding: 0 5px;
`

const LeftColumn = styled('div')`
  padding: 12px;
  border-radius: 0 0 0 8px;
  background-color: #eff2f5;
`

const RightColumn = styled('div')`
  width: 40%;
  padding: 12px;
  display: flex;
  flex-direction: column;
`

const NameInput = styled(Field)`
  display: flex;
  flex-direction: column;
  margin-bottom: 7px;

  & > input[type='text'] {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 4px 8px;
    border: 1px solid #cad3dd;
    border-radius: 4px;
    line-height: 16px;
    font-size: 14px;
    margin-top: 2px;

    &:hover {
      border-color: #43b5c0;
    }

    &:hover,
    :focus {
      box-shadow: none;
    }
  }

  & span {
    display: block;
    width: 100%;
  }
`

const AttachmentOutput = styled('span')`
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 4px 8px;
  border: 1px solid #cad3dd;
  border-radius: 4px;
  line-height: 16px;
  font-size: 14px;
  background-color: #eff2f5;
  margin-top: 2px;
`

const Buttons = styled('div')`
  display: flex;
  flex-direction: row;
  margin-top: auto;
  justify-content: flex-end;
  gap: 8px;
`

const buttonCommonStyles = css`
  width: fit-content;
  padding: 5px 8px;
  text-transform: none;
  font-size: 12px;
  line-height: 14px;
  box-shadow: none;
`

const SaveButton = styled(Button)`
  ${buttonCommonStyles}
  background-color: #167782;

  &:hover {
    background-color: #43b5c0;
    box-shadow: none;
  }
`

const CancelButton = styled(Button)`
  ${buttonCommonStyles}
  border-color: #585858;
  color: #585858;

  &:hover {
    border-color: #333333;
    color: #333333;
    box-shadow: none;
  }
`

const editorStyles = {
  selectionStyle: {
    fill: '#167782',
    'fill-opacity': '0.28',
    stroke: '#167782'
  },
  hoverStyle: { stroke: '#1a7090', 'stroke-width': 1.2 },
  hoverStyleSimpleObject: { 'stroke-opacity': 0.3 }
}

class Attach extends Component {
  constructor({ onInit, ...props }) {
    super()
    this.tmpl = initTmpl(props.tmpl)
    onInit(this.tmpl.struct.name, this.tmpl.props)
    this.onResult = this.onResult.bind(this)
  }

  onResult() {
    const { name, atomid, bondid } = this.props
    return name &&
      (name !== this.tmpl.struct.name ||
        atomid !== this.tmpl.props.atomid ||
        bondid !== this.tmpl.props.bondid) &&
      name.trim().length
      ? { name, attach: { atomid, bondid } }
      : null
  }

  checkUniqueName(name) {
    return !this.props.templateLib.some(
      (tmpl) =>
        tmpl.struct.name === name && tmpl.props.group === 'User Templates'
    )
  }

  render() {
    const { name, onNameEdit, onAttachEdit, ...prop } = this.props
    const struct = this.tmpl.struct
    const { atomid, bondid } =
      struct.atoms.get(this.props.atomid) && struct.bonds.get(this.props.bondid)
        ? this.props
        : this.tmpl.props
    const options = Object.assign(editorStyles, this.props.globalSettings, {
      scale: getScale(struct)
    })

    return (
      <TemplateEditDialog
        title="Template edit"
        result={this.onResult}
        valid={() => this.props.formState.valid && name}
        params={prop}
        buttons={[]}
      >
        <Form
          schema={attachSchema}
          customValid={{
            name: (name) => this.checkUniqueName(name)
          }}
          {...this.props.formState}
        >
          <LeftColumn>
            <Editor>
              <StructEditor
                className="structEditor"
                struct={struct}
                onAttachEdit={onAttachEdit}
                tool="attach"
                toolOpts={{ atomid, bondid }}
                options={options}
                showAttachmentPoints={false}
              />
            </Editor>
            {!storage.isAvailable() ? (
              <Warning>{storage.warningMessage}</Warning>
            ) : null}
          </LeftColumn>
          <RightColumn>
            <NameInput
              name="name"
              value={name}
              onChange={this.props.onNameEdit}
              placeholder="template"
            />
            <span>Selected attachment points</span>
            <AttachmentOutput>
              Atom ID: <strong>{atomid}</strong> Bond ID:{' '}
              <strong>{bondid}</strong>
            </AttachmentOutput>
            <Buttons>
              <CancelButton variant="outlined" onClick={this.props.onCancel} className={classes.button}>
                Cancel
              </CancelButton>
              <SaveButton
                variant="contained"
                onClick={() => this.props.onOk(this.onResult())}
                 className={classes.button}
              >
                Apply
              </SaveButton>
            </Buttons>
          </RightColumn>
        </Form>
      </TemplateEditDialog>
    )
  }
}

export default connect(
  (store) => ({
    ...store.templates.attach,
    templateLib: store.templates.lib,
    formState: store.modal.form,
    globalSettings: store.options.settings
  }),
  (dispatch) => ({
    onInit: (name, ap) => dispatch(initAttach(name, ap)),
    onAttachEdit: (ap) => dispatch(setAttachPoints(ap)),
    onNameEdit: (name) => dispatch(setTmplName(name))
  })
)(Attach)

function initTmpl(tmpl) {
  const normTmpl = {
    struct: structNormalization(tmpl.struct),
    props: {
      atomid: +tmpl.props.atomid || 0,
      bondid: +tmpl.props.bondid || 0
    }
  }
  normTmpl.struct.name = tmpl.struct.name
  return normTmpl
}

function structNormalization(struct) {
  const normStruct = struct.clone()
  const cbb = normStruct.getCoordBoundingBox()

  normStruct.atoms.forEach((atom) => {
    atom.pp = atom.pp.sub(cbb.min)
  })

  normStruct.sgroups.forEach((sg) => {
    sg.pp = sg.pp ? sg.pp.sub(cbb.min) : cbb.min
  })

  normStruct.rxnArrows.forEach((rxnArrow) => {
    rxnArrow.pos = rxnArrow.pos.map((p) => p.sub(cbb.min))
  })

  normStruct.rxnPluses.forEach((rxnPlus) => {
    rxnPlus.pp = rxnPlus.pp.sub(cbb.min)
  })

  normStruct.simpleObjects.forEach((simpleObject) => {
    simpleObject.pos = simpleObject.pos.map((p) => p.sub(cbb.min))
  })

  normStruct.texts.forEach((text) => {
    text.position = text.position.sub(cbb.min)
  })

  return normStruct
}

function getScale(struct) {
  const cbb = struct.getCoordBoundingBox()
  const VIEW_SIZE = 220
  const scale =
    VIEW_SIZE / Math.max(cbb.max.y - cbb.min.y, cbb.max.x - cbb.min.x)
  if (scale < 35) return 35
  if (scale > 50) return 50
  return 40
}
