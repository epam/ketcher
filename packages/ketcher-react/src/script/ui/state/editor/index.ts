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
import type { EditorInitState, RGroupEditParameters } from './types';
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
      if (action === undefined) sleep(0).then(() => dispatch(resetToSelect()));
      // Editor switched to view only mode
      if (action === 'force')
        sleep(0).then(() => dispatch(resetToSelect(true)));
      // new tool in reducer
      else sleep(0).then(() => dispatch(resetToSelect()));
    },
    onSelectionChange: () => {
      updateAction();
    },
    onElementEdit: (selem: Atom | Atom[] | TextEditPayload) => {
      if (isTextEditPayload(selem)) {
        // TODO: move textdialog opening logic to another place
        return openDialog(dispatch, 'text', selem);
      }
      if (isAtomsArray(selem)) {
        const atomAttributes = generateCommonProperties(
          selem,
          fromAtom(selem[0]),
        );
        return openDialog(dispatch, 'atomProps', {
          ...atomAttributes,
          isMultipleAtoms: true,
        }).then((resource) => toElement(resource as ElementFormData));
      }
      const fromResult = fromElement(selem);
      if (!fromResult) return;
      const element = fromResult as ElementFormData;
      let dlg: Promise<unknown>;
      if (Elements.get(element.label ?? '')) {
        dlg = openDialog(dispatch, 'atomProps', element);
      } else if (Object.keys(element).length === 1 && 'ap' in element) {
        dlg = openDialog(dispatch, 'attachmentPoints', element.ap).then(
          (resource) => ({
            ap: resource,
          }),
        );
      } else if (element.type === 'rlabel') {
        const rgroups = getState().editor.struct().rgroups;
        const parameters = {
          type: 'atom',
          values: element.values,
          disabledIds: Array.from(rgroups.entries()).reduce<number[]>(
            (accumulator, [rgid, rg]) => {
              if (element.fragId !== undefined && rg.frags.has(element.fragId))
                accumulator.push(rgid);
              return accumulator;
            },
            [],
          ),
        };
        dlg = openDialog(dispatch, 'rgroup', parameters).then((resource) => ({
          values: (resource as { values: unknown[] }).values,
          type: 'rlabel',
        }));
      } else {
        // list/not-list and all other pseudo elements share this dialog flow
        dlg = openDialog(
          dispatch,
          element.pseudo ? 'extended-table' : 'period-table',
          { ...element, pseudo: element.pseudo },
        );
      }
      return dlg.then((resource) => toElement(resource as ElementFormData));
    },

    // TODO: correct
    onEnhancedStereoEdit: (parameters: { stereoLabel: string | null }) =>
      sleep(0).then(() => {
        const init = fromStereoLabel(parameters.stereoLabel);
        return openDialog(dispatch, 'enhancedStereo', {
          init,
        }).then(
          (resource) =>
            toStereoLabel(resource as ReturnType<typeof fromStereoLabel>),
          () => null,
        );
      }),

    onQuickEdit: (atom: Atom) => openDialog(dispatch, 'labelEdit', atom),
    onBondEdit: (bonds: Bond[]) => {
      const bondsAttributes = generateCommonProperties(bonds, bonds[0]);
      return openDialog(
        dispatch,
        'bondProps',
        fromBond(bondsAttributes as unknown as Bond),
      ).then((resource) => toBond(resource as ReturnType<typeof fromBond>));
    },
    onRgroupEdit: (rgroup: RGroupEditParameters) => {
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
        (accumulator, atom) => {
          if (atom.fragment === rgroup.fragId && atom.rglabel !== null)
            return accumulator.concat(
              (fromElement(atom) as { values?: (string | number)[] })?.values ??
                [],
            );
          return accumulator;
        },
        [],
      );
      const parameters = {
        type: 'fragment',
        values: [rgroup.label],
        disabledIds,
      };
      return openDialog(dispatch, 'rgroup', parameters).then((resource) => ({
        label: (resource as { values: unknown[] }).values[0],
      }));
    },
    onSgroupEdit: (sgroup: SGroupInput) =>
      sleep(0) // hack to open dialog after dispatch sgroup tool action
        .then(() =>
          openDialog(dispatch, 'sgroup', {
            ...fromSgroup(sgroup),
            selectedSruCount: getSelectedSruCount(sgroup.type),
          }),
        )
        .then((resource) => toSgroup(resource as SGroupFormData)),
    onRemoveFG: (result: Record<string, unknown>) =>
      sleep(0).then(() => openDialog(dispatch, 'removeFG', result)),
    onEditMonomer: (payload: EditMonomerPayload) =>
      sleep(0).then(() => openDialog(dispatch, 'editMonomer', payload)),
    onMessage: (message: { error?: unknown }) => {
      if (message.error) {
        // TODO: add error handler call
      }
    },
    onAromatizeStruct: (struct: Struct) => {
      const state = getState();
      const serverOptions = state.options.getServerSettings();
      return serverCall(
        state.editor,
        state.server,
        'aromatize',
        serverOptions,
        struct,
      ).catch((error: unknown) => {
        KetcherLogger.error('index.ts::initEditor::onAromatizeStruct', error);
        state.editor.errorHandler?.(String(error));
      });
    },
    onDearomatizeStruct: (struct: Struct) => {
      const state = getState();
      const serverOptions = state.options.getServerSettings();
      return serverCall(
        state.editor,
        state.server,
        'dearomatize',
        serverOptions,
        struct,
      ).catch((error: unknown) => {
        KetcherLogger.error('index.ts::initEditor::onDearomatizeStruct', error);
        state.editor.errorHandler?.(String(error));
      });
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
