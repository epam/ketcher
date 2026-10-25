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
  fromAtom,
  fromBond,
  fromElement,
  fromSgroup,
  fromStereoLabel,
  toBond,
  toElement,
  toSgroup,
  toStereoLabel,
  type ElementFormData,
  type SGroupFormData,
  type SGroupInput,
} from '../../data/convert/structconv';

import {
  Elements,
  KetcherLogger,
  type Atom,
  type Bond,
  type EditMonomerPayload,
  type FloatingToolsParams,
  type Struct,
} from 'ketcher-core';
import acts from '../../action';
import { debounce } from 'lodash/fp';
import { openDialog } from '../modal';
import { highlightFG } from '../functionalGroups';
import { serverCall } from '../server';
import { isAtomsArray } from '../modal/atoms';
import { generateCommonProperties } from './utils';
import { saveSettings } from '../options';
import { memoizedDebounce } from '../../utils';
import { updateFloatingTools } from '../floatingTools';
import { openInfoModalWithCustomMessage } from '../shared';
import { shouldResetToSelect } from './shouldResetToSelect';
import type { AppDispatch } from '../hooks';
import type { EditorInitState, RGroupEditParams } from './types';
import type { InfoPanelData } from '../../../editor/utils/functionalGroupsTooltip';
import type Editor from '../../../editor/Editor';

type TextEditPayload = { type: 'text' } & Record<string, unknown>;

const isTextEditPayload = (
  selem: Atom | Atom[] | TextEditPayload,
): selem is TextEditPayload => 'type' in selem && selem.type === 'text';

export default function initEditor(
  dispatch: AppDispatch,
  getState: () => EditorInitState,
  ketcherId: string,
) {
  const updateAction = debounce(100, () => dispatch({ type: 'UPDATE' }));
  const sleep = (time: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, time));

  const getSelectedSruCount = (sgroupType: string | undefined): number => {
    const editor = getState().editor;
    if (!editor?.structSelected) return 0;
    const selectedStruct = editor.structSelected();
    let count = 0;
    for (const sgroup of selectedStruct.sgroups.values()) {
      if (sgroup.type === 'SRU') {
        count += 1;
      }
    }
    return sgroupType === 'COP' ? Math.max(2, count) : count;
  };

  const resetToSelect =
    (force = false) =>
    async (dispatch: AppDispatch) => {
      const state = getState();
      const activeToolAction = state.actionState?.activeTool;
      const toolAction =
        typeof activeToolAction !== 'function' ? activeToolAction : null;
      const activeTool = toolAction?.tool;
      if (!activeTool || (activeTool === 'select' && !force)) return;
      const selectMode = state.toolbar.visibleTools.select;
      const resetOption = state.options.settings.resetToSelect;
      if (
        shouldResetToSelect(
          activeTool,
          resetOption,
          typeof toolAction?.opts === 'string' ? toolAction.opts : undefined,
        ) ||
        force === true
      )
        // example: 'paste'
        dispatch({ type: 'ACTION', action: acts[selectMode].action });
      else updateAction();
    };

  return {
    onInit: (editor: Editor) => {
      dispatch({ type: 'INIT', editor });
    },
    onChange: (action: string | undefined) => {
      if (action === undefined)
        void (async () => {
          await sleep(0);
          dispatch(resetToSelect());
        })();
      // Editor switched to view only mode
      if (action === 'force')
        void (async () => {
          await sleep(0);
          dispatch(resetToSelect(true));
        })();
      // new tool in reducer
      else
        void (async () => {
          await sleep(0);
          dispatch(resetToSelect());
        })();
    },
    onSelectionChange: () => {
      updateAction();
    },
    onElementEdit: async (selem: Atom | Atom[] | TextEditPayload) => {
      if (isTextEditPayload(selem)) {
        // TODO: move textdialog opening logic to another place
        return openDialog(dispatch, 'text', selem);
      }
      if (isAtomsArray(selem)) {
        const atomAttributes = generateCommonProperties(
          selem,
          fromAtom(selem[0]),
        );
        const res = await openDialog(dispatch, 'atomProps', {
          ...atomAttributes,
          isMultipleAtoms: true,
        });
        return toElement(res as ElementFormData);
      }
      const fromResult = fromElement(selem);
      if (!fromResult) return;
      const elem = fromResult as ElementFormData;
      let dlg: unknown;
      if (Elements.get(elem.label ?? '')) {
        dlg = await openDialog(dispatch, 'atomProps', elem);
      } else if (Object.keys(elem).length === 1 && 'ap' in elem) {
        dlg = {
          ap: await openDialog(dispatch, 'attachmentPoints', elem.ap),
        };
      } else if (elem.type === 'rlabel') {
        const rgroups = getState().editor.struct().rgroups;
        const params = {
          type: 'atom',
          values: elem.values,
          disabledIds: Array.from(rgroups.entries()).reduce<number[]>(
            (acc, [rgid, rg]) => {
              if (elem.fragId !== undefined && rg.frags.has(elem.fragId))
                acc.push(rgid);
              return acc;
            },
            [],
          ),
        };
        const res = (await openDialog(dispatch, 'rgroup', params)) as {
          values: unknown[];
        };
        dlg = {
          values: res.values,
          type: 'rlabel',
        };
      } else {
        // list/not-list and all other pseudo elements share this dialog flow
        dlg = await openDialog(
          dispatch,
          elem.pseudo ? 'extended-table' : 'period-table',
          { ...elem, pseudo: elem.pseudo },
        );
      }
      return toElement(dlg as ElementFormData);
    },

    // TODO: correct
    onEnhancedStereoEdit: async (params: { stereoLabel: string | null }) => {
      await sleep(0);
      const init = fromStereoLabel(params.stereoLabel);
      let res;
      try {
        res = await openDialog(dispatch, 'enhancedStereo', { init });
      } catch {
        return null;
      }
      return toStereoLabel(res as ReturnType<typeof fromStereoLabel>);
    },

    onQuickEdit: (atom: Atom) => openDialog(dispatch, 'labelEdit', atom),
    onBondEdit: async (bonds: Bond[]) => {
      const bondsAttributes = generateCommonProperties(bonds, bonds[0]);
      const res = await openDialog(
        dispatch,
        'bondProps',
        fromBond(bondsAttributes as unknown as Bond),
      );
      return toBond(res as ReturnType<typeof fromBond>);
    },
    onRgroupEdit: async (rgroup: RGroupEditParams) => {
      const struct = getState().editor.struct();

      if (Object.keys(rgroup).length > 2) {
        const rgroupLabels = Array.from(struct.rgroups.keys());
        if (!rgroup.range) rgroup.range = '>0';

        return openDialog(dispatch, 'rgroupLogic', {
          rgroupLabels,
          ...rgroup,
        });
      }

      const disabledIds = Array.from(struct.atoms.values()).reduce<unknown[]>(
        (acc, atom) => {
          if (atom.fragment === rgroup.fragId && atom.rglabel !== null)
            return acc.concat(
              (fromElement(atom) as { values?: (string | number)[] })?.values ??
                [],
            );
          return acc;
        },
        [],
      );
      const params = {
        type: 'fragment',
        values: [rgroup.label],
        disabledIds,
      };
      const res = await openDialog(dispatch, 'rgroup', params);
      return {
        label: (res as { values: unknown[] }).values[0],
      };
    },
    onSgroupEdit: async (sgroup: SGroupInput) => {
      await sleep(0); // hack to open dialog after dispatch sgroup tool action
      const res = await openDialog(dispatch, 'sgroup', {
        ...fromSgroup(sgroup),
        selectedSruCount: getSelectedSruCount(sgroup.type),
      });
      return toSgroup(res as SGroupFormData);
    },
    onRemoveFG: async (result: Record<string, unknown>) => {
      await sleep(0);
      return openDialog(dispatch, 'removeFG', result);
    },
    onEditMonomer: async (payload: EditMonomerPayload) => {
      await sleep(0);
      return openDialog(dispatch, 'editMonomer', payload);
    },
    onMessage: (msg: { error?: unknown }) => {
      if (msg.error) {
        // TODO: add error handler call
      }
    },
    onAromatizeStruct: async (struct: Struct) => {
      const state = getState();
      const serverOpts = state.options.getServerSettings();
      try {
        await serverCall(
          state.editor,
          state.server,
          'aromatize',
          serverOpts,
          struct,
        );
      } catch (e: unknown) {
        KetcherLogger.error('index.ts::initEditor::onAromatizeStruct', e);
        state.editor.errorHandler?.(String(e));
      }
    },
    onDearomatizeStruct: async (struct: Struct) => {
      const state = getState();
      const serverOpts = state.options.getServerSettings();
      try {
        await serverCall(
          state.editor,
          state.server,
          'dearomatize',
          serverOpts,
          struct,
        );
      } catch (e: unknown) {
        KetcherLogger.error('index.ts::initEditor::onDearomatizeStruct', e);
        state.editor.errorHandler?.(String(e));
      }
    },
    onMouseDown: () => {
      updateAction();
    },
    onConfirm: (payload?: Record<string, unknown>) =>
      openDialog(dispatch, 'confirm', payload),
    onShowInfo: (payload: InfoPanelData | null | undefined) => {
      if (payload) {
        const { groupStruct, event, sGroup } = payload;
        highlightFG(dispatch, { groupStruct, event, sGroup });
      } else {
        highlightFG(dispatch, { groupStruct: null, sGroup: null });
      }
    },
    onApiSettings: (payload: Record<string, unknown>) =>
      dispatch(saveSettings(payload, ketcherId)),

    onUpdateFloatingTools: memoizedDebounce((payload: FloatingToolsParams) => {
      dispatch(updateFloatingTools(payload));
    }),

    onZoomIn: updateAction,
    onZoomOut: updateAction,
    onZoomChanged: updateAction,

    onShowMacromoleculesErrorMessage: (payload: string) =>
      dispatch(openInfoModalWithCustomMessage(payload)),
  };
}
