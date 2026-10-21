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

import { capitalize, isEqual, throttle } from 'lodash/fp';

import { basicAtoms } from '../../action/atoms';
import tools from '../../action/tools';
import type {
  ActiveTool,
  AddAtomsAction,
  ClearVisibleAction,
  ToolbarAction,
  ToolbarResizeState,
  ToolbarState,
  VisibleTools,
} from './types';

const initial: ToolbarState = {
  freqAtoms: [],
  currentAtom: 0,
  opened: null,
  visibleTools: {
    select: 'select-rectangle',
  },
};
const MAX_ATOMS = 7;

function updateVisibleTools(
  visibleTool: VisibleTools,
  activeTool: VisibleTools | null,
): VisibleTools {
  const regExp = /(bond)(-)(common|stereo|query)/;
  const menuHeight = globalThis.innerHeight;

  return Object.keys(visibleTool).reduce<VisibleTools>(
    (res, key) => {
      if (key === 'bond' && menuHeight > 700) return res; // TODO remove me after update styles
      if (key === 'transform' && menuHeight > 800) return res;
      if (key === 'rgroup' && menuHeight > 850) return res;
      if (key === 'shape' && menuHeight > 900) return res;
      const matchesBondGroup = regExp.exec(key);
      if (!matchesBondGroup || menuHeight > 700) res[key] = visibleTool[key];
      return res;
    },
    { ...activeTool },
  );
}

let resizeListener: VoidFunction | null = null;

export function initResize() {
  return function (
    dispatch: (action: ClearVisibleAction) => void,
    getState: () => ToolbarResizeState,
  ): void {
    resizeListener = throttle(250, () => {
      const state = getState();
      if (!state.editor) return;
      state.editor.render.update();
      dispatch({ type: 'CLEAR_VISIBLE', data: state.actionState?.activeTool });
    });
    addEventListener('resize', resizeListener);
  };
}

export function removeResizeListener(): void {
  if (resizeListener) {
    removeEventListener('resize', resizeListener);
    resizeListener = null;
  }
}

/* REDUCER */
export default function (
  state: ToolbarState = initial,
  action: ToolbarAction,
): ToolbarState {
  switch (action.type) {
    case 'ACTION': {
      const visibleTool = toolInMenu(action.action);
      return visibleTool
        ? {
            ...state,
            opened: null,
            visibleTools: { ...state.visibleTools, ...visibleTool },
          }
        : { ...state, opened: null };
    }
    case 'ADD_ATOMS': {
      const newState = addFreqAtom(
        action.data,
        state.freqAtoms,
        state.currentAtom,
      );
      return { ...state, ...newState };
    }
    case 'CLEAR_VISIBLE': {
      const activeTool = toolInMenu(action.data);
      const correctTools = updateVisibleTools(state.visibleTools, activeTool);
      return { ...state, opened: null, visibleTools: { ...correctTools } };
    }
    case 'OPENED': {
      const { data } = action;
      return data.isSelected && state.opened
        ? { ...state, opened: null }
        : { ...state, opened: data.menuName };
    }
    case 'UPDATE':
      return { ...state, opened: null };
    case 'MODAL_OPEN':
      return { ...state, opened: null };
    default:
      return state;
  }
}
/* ------- */

function addFreqAtom(
  label: string,
  freqAtoms: string[],
  index: number,
): Pick<ToolbarState, 'freqAtoms'> &
  Partial<Pick<ToolbarState, 'currentAtom'>> {
  label = capitalize(label);
  if (basicAtoms.indexOf(label) > -1 || freqAtoms.indexOf(label) !== -1)
    return { freqAtoms };

  freqAtoms[index] = label;
  index = (index + 1) % MAX_ATOMS;

  return { freqAtoms, currentAtom: index };
}

export function addAtoms(atomLabel: string): AddAtomsAction {
  return {
    type: 'ADD_ATOMS',
    data: atomLabel,
  };
}

function toolInMenu(action: ActiveTool): VisibleTools | null {
  const tool = Object.keys(tools).find((toolName) =>
    isEqual(action, tools[toolName].action),
  );

  const sel = tool ? document.getElementById(tool) : null;
  const dropdown = sel && hiddenAncestor(sel);

  return sel && dropdown && dropdown.id !== ''
    ? { [dropdown.id]: sel.id }
    : null;
}

export function hiddenAncestor(
  el: HTMLElement | null,
  base?: HTMLElement,
): HTMLElement | null {
  base = base || document.body;
  let findEl = el;

  while (
    findEl &&
    globalThis.getComputedStyle(findEl).overflow !== 'hidden' &&
    !findEl.classList.contains('opened')
  ) {
    if (findEl === base) return null;
    findEl = findEl.parentElement;
  }

  return findEl;
}
