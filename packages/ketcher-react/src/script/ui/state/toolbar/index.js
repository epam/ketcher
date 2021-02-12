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

import { capitalize, throttle, isEqual } from 'lodash/fp'
import { basicAtoms } from '../../action/atoms'
import tools from '../../action/tools'

const initial = {
  freqAtoms: [],
  currentAtom: 0,
  opened: null,
  visibleTools: {
    select: 'select-lasso'
  }
}
const MAX_ATOMS = 7

function updateVisibleTools(visibleTool, activeTool) {
  const regExp = /(bond)(-)(common|stereo|query)/
  const menuHeight = window.innerHeight

  return Object.keys(visibleTool).reduce(
    (res, key) => {
      if (key === 'bond' && menuHeight > 700) return res // TODO remove me after update styles
      if (key === 'transform' && menuHeight > 800) return res
      if (key === 'rgroup' && menuHeight > 850) return res
      if (key === 'shape' && menuHeight > 900) return res
      if (!key.match(regExp) || menuHeight > 700) res[key] = visibleTool[key]
      return res
    },
    { ...activeTool }
  )
}

export function initResize() {
  return function (dispatch, getState) {
    const onResize = throttle(250, () => {
      const state = getState()
      state.editor.render.update()
      dispatch({ type: 'CLEAR_VISIBLE', data: state.actionState.activeTool })
    })
    addEventListener('resize', onResize) // eslint-disable-line
  }
}

/* REDUCER */
export default function (state = initial, action) {
  const { type, data } = action

  switch (type) {
    case 'ACTION': {
      const visibleTool = toolInMenu(action.action)
      return visibleTool
        ? {
            ...state,
            opened: null,
            visibleTools: { ...state.visibleTools, ...visibleTool }
          }
        : { ...state, opened: null }
    }
    case 'ADD_ATOMS': {
      const newState = addFreqAtom(data, state.freqAtoms, state.currentAtom)
      return { ...state, ...newState }
    }
    case 'CLEAR_VISIBLE': {
      const activeTool = toolInMenu(action.data)
      const correctTools = updateVisibleTools(state.visibleTools, activeTool)
      return { ...state, opened: null, visibleTools: { ...correctTools } }
    }
    case 'OPENED': {
      return data.isSelected && state.opened
        ? { ...state, opened: null }
        : { ...state, opened: data.menuName }
    }
    case 'UPDATE':
      return { ...state, opened: null }
    case 'MODAL_OPEN':
      return { ...state, opened: null }
    default:
      return state
  }
}
/* ------- */

function addFreqAtom(label, freqAtoms, index) {
  label = capitalize(label)
  if (basicAtoms.indexOf(label) > -1 || freqAtoms.indexOf(label) !== -1)
    return { freqAtoms }

  freqAtoms[index] = label
  index = (index + 1) % MAX_ATOMS

  return { freqAtoms, currentAtom: index }
}

export function addAtoms(atomLabel) {
  return {
    type: 'ADD_ATOMS',
    data: atomLabel
  }
}

function toolInMenu(action) {
  const tool = Object.keys(tools).find(toolName =>
    isEqual(action, tools[toolName].action)
  )

  const sel = document.getElementById(tool)
  const dropdown = sel && hiddenAncestor(sel)

  return dropdown && dropdown.id !== '' ? { [dropdown.id]: sel.id } : null
}

export function hiddenAncestor(el, base) {
  base = base || document.body
  let findEl = el

  while (
    findEl &&
    window.getComputedStyle(findEl).overflow !== 'hidden' &&
    !findEl.classList.contains('opened')
  ) {
    if (findEl === base) return null
    findEl = findEl.parentNode
  }

  return findEl
}
