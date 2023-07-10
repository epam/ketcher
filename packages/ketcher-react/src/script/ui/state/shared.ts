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

import {
  FormatterFactory,
  Pile,
  SGroup,
  getStereoAtomsMap,
  identifyStructFormat,
  Struct,
  SupportedFormat,
  emitEventRequestIsFinished,
} from 'ketcher-core';

import { supportedSGroupTypes } from './constants';
import { setAnalyzingFile } from './request';
import tools from '../action/tools';
import { SettingsManager } from '../utils/settingsManager';

export function onAction(action) {
  if (action && action.dialog) {
    return {
      type: 'MODAL_OPEN',
      data: { name: action.dialog, prop: action.prop },
    };
  }
  if (action && action.thunk) {
    return action.thunk;
  }

  return {
    type: 'ACTION',
    action,
  };
}

export function loadStruct(struct) {
  return (_dispatch, getState) => {
    const editor = getState().editor;
    editor.struct(struct);
  };
}

function parseStruct(
  struct: string | Struct,
  server,
  options?,
): Promise<Struct> {
  if (typeof struct === 'string') {
    options = options || {};
    const {
      /* eslint-disable @typescript-eslint/no-unused-vars */
      rescale,
      fragment,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      ...formatterOptions
    } = options;

    const format = identifyStructFormat(struct);
    if (format === SupportedFormat.cdx) {
      struct = `base64::${struct.replace(/\s/g, '')}`;
    }
    const factory = new FormatterFactory(server);

    const service = factory.create(format, formatterOptions);
    return service.getStructureFromStringAsync(struct);
  } else {
    return Promise.resolve(struct);
  }
}

// Removing from what should be saved - structure, which was added to paste tool,
// but not yet rendered on canvas
export function removeStructAction(): {
  type: string;
  action?: Record<string, unknown>;
} {
  const savedSelectedTool = SettingsManager.selectionTool;

  return onAction(savedSelectedTool || tools['select-rectangle'].action);
}

export function load(struct: Struct, options?) {
  return async (dispatch, getState) => {
    const state = getState();
    const editor = state.editor;
    const server = state.server;
    const errorHandler = editor.errorHandler;

    options = options || {};
    options = {
      ...options,
      'dearomatize-on-load': editor.options()['dearomatize-on-load'],
      ignoreChiralFlag: editor.options().ignoreChiralFlag,
    };

    dispatch(setAnalyzingFile(true));

    try {
      const parsedStruct = await parseStruct(struct, server, options);
      const { fragment } = options;
      const hasUnsupportedGroups = parsedStruct.sgroups.some(
        (sGroup) => !supportedSGroupTypes[sGroup.type],
      );

      if (hasUnsupportedGroups) {
        await editor.event.confirm.dispatch();
        parsedStruct.sgroups = parsedStruct.sgroups.filter(
          (_key, sGroup) => supportedSGroupTypes[sGroup.type],
        );
      }

      parsedStruct.rescale(); // TODO: move out parsing?

      if (editor.struct().atoms.size) {
        // NB: reset id
        const oldStruct = editor.struct().clone();
        parsedStruct.sgroups.forEach((sg, sgId) => {
          const offset = SGroup.getOffset(oldStruct.sgroups.get(sgId));
          const atomSet = new Pile(sg.atoms);
          const crossBonds = SGroup.getCrossBonds(parsedStruct, atomSet);
          SGroup.bracketPos(sg, parsedStruct, crossBonds);
          if (offset) sg.updateOffset(offset);
        });
      }

      parsedStruct.findConnectedComponents();
      parsedStruct.setImplicitHydrogen();

      const stereAtomsMap = getStereoAtomsMap(
        parsedStruct,
        Array.from(parsedStruct.bonds.values()),
      );

      parsedStruct.atoms.forEach((atom, id) => {
        if (parsedStruct?.atomGetNeighbors(id)?.length === 0) {
          atom.stereoLabel = null;
          atom.stereoParity = 0;
        } else {
          const stereoProp = stereAtomsMap.get(id);
          if (stereoProp) {
            atom.stereoLabel = stereoProp.stereoLabel;
            atom.stereoParity = stereoProp.stereoParity;
          }
        }
      });

      parsedStruct.markFragments();

      if (fragment) {
        if (parsedStruct.isBlank()) {
          dispatch(removeStructAction());
        } else {
          dispatch(onAction({ tool: 'paste', opts: parsedStruct }));
        }
      } else {
        editor.struct(parsedStruct);
      }

      editor.zoomAccordingContent();

      dispatch(setAnalyzingFile(false));
      dispatch({ type: 'MODAL_CLOSE' });
    } catch (err: any) {
      dispatch(setAnalyzingFile(false));
      err && errorHandler(err.message);
    } finally {
      emitEventRequestIsFinished();
    }
  };
}

export function openInfoModal(command: 'Paste' | 'Copy' | 'Cut'): {
  type: 'MODAL_OPEN'
  data: { name: 'info-modal'; prop: { message: 'Paste' | 'Copy' | 'Cut' } }
} {
  return {
    type: 'MODAL_OPEN',
    data: { name: 'info-modal', prop: { message: command } }
  }
}
