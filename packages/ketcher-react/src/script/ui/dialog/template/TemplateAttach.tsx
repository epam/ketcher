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

import { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import type { Struct } from 'ketcher-core'

import { Dialog, StructEditor } from '../../views/components'
import { initAttach, setAttachPoints, setTmplName } from '../../state/templates'
import { storage } from '../../storage-ext'
import Form, { Field } from '../../component/form/form/form'
import { attachSchema } from '../../data/schema/struct-schema'
import classes from './template-lib.module.less'

const EDITOR_STYLES = {
  selectionStyle: { fill: '#47b3ec', stroke: 'none' },
  hoverStyle: { stroke: '#1a7090', 'stroke-width': 1.2 },
  hoverStyleSimpleObject: { 'stroke-opacity': 0.3 }
}

type Template = {
  struct: Struct
  props: {
    atomid: number
    bondid: number
  }
}

const Attach = (props) => {
  const [tmpl, setTmpl] = useState<Template | null>(null)
  const { name, onNameEdit, onAttachEdit, ...prop } = props

  useEffect(() => {
    const tmpl = initTmpl(props.tmpl)
    setTmpl(tmpl)
    props.onInit(tmpl.struct.name, tmpl.props)
  }, [])

  if (!tmpl) {
    return null
  }

  const struct = tmpl.struct
  const { atomid, bondid } =
    struct.atoms.get(props.atomid) && struct.bonds.get(props.bondid)
      ? props
      : tmpl.props
  const options = Object.assign(EDITOR_STYLES, props.globalSettings, {
    scale: getScale(struct)
  })

  const onResult = () => {
    const { name, atomid, bondid } = props
    return name &&
      (name !== tmpl.struct.name ||
        atomid !== tmpl.props.atomid ||
        bondid !== tmpl.props.bondid) &&
      name.trim().length
      ? { name, attach: { atomid, bondid } }
      : null
  }

  const checkUniqueName = (name) => {
    return !props.templateLib.some(
      (tmpl) =>
        tmpl.struct.name === name && tmpl.props.group === 'User Templates'
    )
  }

  return (
    <Dialog
      title="Template Edit"
      className={classes.attach}
      result={onResult}
      valid={() => props.formState.valid && name}
      params={prop}>
      <Form
        schema={attachSchema}
        customValid={{
          name: (name) => checkUniqueName(name)
        }}
        {...props.formState}>
        <Field
          name="name"
          value={name}
          onChange={onNameEdit}
          placeholder="template"
        />
        <label>Choose attachment atom and bond:</label>
        <StructEditor
          className={classes.editor}
          struct={struct}
          onAttachEdit={onAttachEdit}
          tool="attach"
          toolOpts={{ atomid, bondid }}
          options={options}
        />
        {!storage.isAvailable() ? (
          <div className={classes.warning}>{storage.warningMessage}</div>
        ) : null}
      </Form>
    </Dialog>
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

function getScale(struct) {
  const cbb = struct.getCoordBoundingBox()
  const VIEW_SIZE = 220
  let scale = VIEW_SIZE / Math.max(cbb.max.y - cbb.min.y, cbb.max.x - cbb.min.x)

  if (scale < 35) scale = 35
  if (scale > 50) scale = 50
  return scale
}
