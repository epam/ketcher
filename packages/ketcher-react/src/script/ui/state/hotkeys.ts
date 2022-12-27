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

import * as clipArea from '../component/cliparea/cliparea'

import {
  KetSerializer,
  MolSerializer,
  formatProperties,
  ChemicalMimeType,
  ReAtom
} from 'ketcher-core'
import { debounce, isEqual } from 'lodash/fp'
import { load, onAction } from './shared'

import actions from '../action'
import keyNorm from '../data/convert/keynorm'
import { openDialog } from './modal'
import { isIE } from 'react-device-detect'
import { handleHotkeyOverAtom } from './handleHotkeysOverAtom'

export function initKeydownListener(element) {
  return function (dispatch, getState) {
    const hotKeys = initHotKeys()
    element.addEventListener('keydown', (event) =>
      keyHandle(dispatch, getState(), hotKeys, event)
    )
  }
}

/* HotKeys */
function keyHandle(dispatch, state, hotKeys, event) {
  if (state.modal) return

  const { editor } = state
  const { render } = editor
  const actionState = state.actionState
  const actionTool = actionState.activeTool

  const key = keyNorm(event)
  const atomsSelected = editor.selection() && editor.selection().atoms

  let group: any = null

  if (key && key.length === 1 && atomsSelected && key.match(/\w/)) {
    openDialog(dispatch, 'labelEdit', { letter: key })
      .then((res) => {
        dispatch(onAction({ tool: 'atom', opts: res }))
      })
      .catch(() => null)
    event.preventDefault()
  } else if ((group = keyNorm.lookup(hotKeys, event)) !== undefined) {
    let index = checkGroupOnTool(group, actionTool) // index currentTool in group || -1
    const groupLength = group !== null ? group.length : 1
    index = (index + 1) % groupLength

    const actName = group[index]
    if (actionState[actName] && actionState[actName].disabled === true) {
      event.preventDefault()
      return
    }
    if (clipArea.actions.indexOf(actName) === -1) {
      const newAction = actions[actName].action
      const hoveredItemId = getHoveredAtomId(render.ctab.atoms)
      const isHoveringOverAtom = hoveredItemId !== null
      if (isHoveringOverAtom) {
        // check if atom is currently hovered over
        // in this case we do not want to activate the corresponding tool
        // and just insert the atom directly
        handleHotkeyOverAtom({
          hoveredItemId,
          newAction,
          render,
          editor,
          dispatch
        })
      } else {
        dispatch(onAction(newAction))
      }

      event.preventDefault()
    } else if (isIE) {
      clipArea.exec(event)
    }
  }
}

function getHoveredAtomId(atoms: Map<number, ReAtom>): number | null {
  for (const [id, atom] of atoms.entries()) {
    if (atom.hover) return id
  }
  return null
}

function setHotKey(key, actName, hotKeys) {
  if (Array.isArray(hotKeys[key])) hotKeys[key].push(actName)
  else hotKeys[key] = [actName]
}

function initHotKeys() {
  const hotKeys = {}
  let act

  Object.keys(actions).forEach((actName) => {
    act = actions[actName]
    if (!act.shortcut) return

    if (Array.isArray(act.shortcut)) {
      act.shortcut.forEach((key) => {
        setHotKey(key, actName, hotKeys)
      })
    } else {
      setHotKey(act.shortcut, actName, hotKeys)
    }
  })

  return keyNorm(hotKeys)
}

function checkGroupOnTool(group, actionTool) {
  let index = group.indexOf(actionTool.tool)

  group.forEach((actName, i) => {
    if (isEqual(actions[actName].action, actionTool)) index = i
  })

  return index
}

const rxnTextPlain = /\$RXN\n+\s+0\s+0\s+0\n*/

/* ClipArea */
export function initClipboard(dispatch) {
  const formats = Object.keys(formatProperties).map(
    (format) => formatProperties[format].mime
  )

  const debAction = debounce(0, (action) => dispatch(onAction(action)))
  const loadStruct = debounce(0, (structStr, opts) =>
    dispatch(load(structStr, opts))
  )

  return {
    formats,
    focused() {
      const state = global.currentState
      return !state.modal
    },
    onCut() {
      const state = global.currentState
      const editor = state.editor
      const data = clipData(editor)
      if (data) debAction({ tool: 'eraser', opts: 1 })
      else editor.selection(null)
      return data
    },
    onCopy() {
      const state = global.currentState
      const editor = state.editor
      const data = clipData(editor)
      editor.selection(null)
      return data
    },
    onPaste(data) {
      const structStr =
        data[ChemicalMimeType.KET] ||
        data[ChemicalMimeType.Mol] ||
        data[ChemicalMimeType.Rxn] ||
        data['text/plain']

      if (structStr || !rxnTextPlain.test(data['text/plain']))
        loadStruct(structStr, { fragment: true })
    }
  }
}

function clipData(editor) {
  const res = {}
  const struct = editor.structSelected()
  const errorHandler = editor.errorHandler

  if (struct.isBlank()) return null
  const simpleObjectOrText = Boolean(
    struct.simpleObjects.size || struct.texts.size
  )
  if (simpleObjectOrText && isIE) {
    errorHandler(
      'The structure you are trying to copy contains Simple object or/and Text object.' +
        'To copy Simple object or Text object in Internet Explorer try "Copy as KET" button'
    )
    return null
  }
  const molSerializer = new MolSerializer()
  try {
    const serializer = new KetSerializer()
    const ket = serializer.serialize(struct)
    res[ChemicalMimeType.KET] = ket

    const type = struct.isReaction ? ChemicalMimeType.Mol : ChemicalMimeType.Rxn
    const data = molSerializer.serialize(struct)
    res['text/plain'] = data
    res[type] = data

    // res['chemical/x-daylight-smiles'] = smiles.stringify(struct);
    return res
  } catch (e: any) {
    errorHandler(e.message)
  }

  return null
}
