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

import { CSSProperties, useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Button } from '@mui/material'
import styled from '@emotion/styled'
import type { Struct } from 'ketcher-core'

import { Dialog, StructEditor } from '../../views/components'
import { initAttach, setAttachPoints, setTmplName } from '../../state/templates'
import { storage } from '../../storage-ext'
import Form, { Field } from '../../component/form/form/form'
import { attachSchema } from '../../data/schema/struct-schema'
import type { Template } from './TemplateTable'
import type { BaseProps } from '../../../ui/views/modal/modal.types'

const EDITOR_STYLES = {
  selectionStyle: {
    fill: '#167782',
    'fill-opacity': '0.28',
    stroke: '#167782'
  },
  hoverStyle: { stroke: '#1a7090', 'stroke-width': 1.2 },
  hoverStyleSimpleObject: { 'stroke-opacity': 0.3 }
}

type AttachPoints = {
  atomid: number
  bondid: number
}

type ProcessedTemplate = {
  struct: Struct
  props: AttachPoints
}

interface AttachProps extends BaseProps {
  name: string
  onNameEdit: (name: string) => void
  onAttachEdit: (arg: string) => void
  onInit: (name: string, attach: AttachPoints) => void
  tmpl: Template
  globalSettings: any
  atomid: number
  bondid: number
  templateLib: Template[]
  onOk: (res) => void
  onCancel: () => void
}

// @TODO When theming is implemented, use theme wherever possible
const TemplateEditDialog = styled(Dialog)`
  background-color: #ffff;

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

const Editor = styled(StructEditor)`
  border: 1px solid #b4b9d6;
  background-color: #ffff;
  border-radius: 5px;
  position: relative;
  height: 205px;
  width: 248px;
  overflow: auto;
`

const Warning = styled('div')`
  padding: 0 5px;
`

const LeftColumn = styled('div')`
  width: 60%;
  padding: 7px 4px;
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
    line-height: 12px;
    font-size: 10px;

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
  line-height: 12px;
  font-size: 10px;
  background-color: #eff2f5;
`

const Buttons = styled('div')`
  display: flex;
  flex-direction: row;
  margin-top: auto;
  justify-content: flex-end;
  gap: 8px;
`

const buttonCommonStyles: CSSProperties = {
  width: 'fit-content',
  padding: '5px 8px',
  textTransform: 'none',
  fontSize: '12px',
  lineHeight: '14px',
  boxShadow: 'none'
}

const SaveButton = styled(Button)`
  ${{ ...buttonCommonStyles }}
  background-color: #167782;

  &:hover {
    background-color: #43b5c0;
    box-shadow: none;
  }
`

const CancelButton = styled(Button)`
  ${{ ...buttonCommonStyles }}
  border-color: #585858;
  color: #585858;

  &:hover {
    border-color: #333333;
    color: #333333;
    box-shadow: none;
  }
`

const Attach = ({
  name,
  onNameEdit,
  onAttachEdit,
  onInit,
  tmpl,
  globalSettings,
  atomid,
  bondid,
  templateLib,
  formState,
  onOk,
  onCancel
}: AttachProps) => {
  const [template, setTmpl] = useState<ProcessedTemplate | null>(null)

  useEffect(() => {
    const template = initTmpl(tmpl)
    setTmpl(template)
    onInit(template.struct.name, template.props)
  }, [])

  if (!tmpl) {
    return null
  }

  const onResult = () => {
    return name &&
      (name !== tmpl.struct.name ||
        atomid !== tmpl.props.atomid ||
        bondid !== tmpl.props.bondid) &&
      name.trim().length
      ? { name, attach: { atomid, bondid } }
      : null
  }

  const checkUniqueName = (name) => {
    return !templateLib.some(
      (tmpl) =>
        tmpl.struct.name === name && tmpl.props.group === 'User Templates'
    )
  }

  const struct = tmpl.struct

  const options = Object.assign(EDITOR_STYLES, globalSettings, {
    scale: getScale(struct)
  })

  // @TODO Needs rethinking why this check has to be done
  const atomIdAdjusted = struct.atoms.get(atomid)
    ? atomid
    : template?.props.atomid
  const bondIdAdjusted = struct.bonds.get(bondid)
    ? bondid
    : template?.props.bondid

  return (
    <TemplateEditDialog
      title="Template edit"
      result={onResult}
      valid={() => formState.valid && Boolean(name)}
      buttons={[]}
      params={{ onOk, onCancel }}
    >
      <Form
        schema={attachSchema}
        customValid={{
          name: (name) => checkUniqueName(name)
        }}
        {...formState}
      >
        <LeftColumn>
          <Editor
            struct={struct}
            onAttachEdit={onAttachEdit}
            tool="attach"
            toolOpts={{ atomid: atomIdAdjusted, bondid: bondIdAdjusted }}
            options={options}
            showAttachmentPoints={false}
          />
          {!storage.isAvailable() ? (
            <Warning>{storage.warningMessage}</Warning>
          ) : null}
        </LeftColumn>
        <RightColumn>
          <NameInput
            name="name"
            value={name}
            onChange={onNameEdit}
            placeholder="template"
          />
          <span>Selected attachment points</span>
          <AttachmentOutput>
            Atom ID: <strong>{atomid}</strong> Bond ID:{' '}
            <strong>{bondid}</strong>
          </AttachmentOutput>
          <Buttons>
            <CancelButton variant="outlined" onClick={onCancel}>
              Cancel
            </CancelButton>
            <SaveButton variant="contained" onClick={() => onOk(onResult())}>
              Apply
            </SaveButton>
          </Buttons>
        </RightColumn>
      </Form>
    </TemplateEditDialog>
  )
}

export default connect(
  (store: any) => ({
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

function getScale(struct: Struct) {
  const cbb = struct.getCoordBoundingBox()
  const VIEW_SIZE = 150 // magic number
  let scale = VIEW_SIZE / Math.max(cbb.max.y - cbb.min.y, cbb.max.x - cbb.min.x)

  if (scale < 35) scale = 35
  if (scale > 50) scale = 50
  return scale
}
