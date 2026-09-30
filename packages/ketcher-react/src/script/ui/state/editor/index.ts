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
} from '../../data/convert/structconv';
import type {
  ElementFormData,
  SGroupFormData,
  SGroupInput,
} from '../../data/convert/structconv';

import { Elements, KetcherLogger } from 'ketcher-core';
import type {
  Atom,
  Bond,
  EditMonomerPayload,
  FloatingToolsParams,
  Struct,
} from 'ketcher-core';
import acts from '../../action';
import type { UiActionAction } from '../../action/action.types';
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
import type {
  EditorInitState,
  RGroupEditParams,
  ShowInfoPayload,
} from './types';
import type Editor from '../../../editor/Editor';

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
        typeof activeToolAction !== 'function'
          ? (activeToolAction as
              { tool?: string; opts?: unknown } | null | undefined)
          : null;
      const activeTool = toolAction?.tool;
      if (!activeTool || (activeTool === 'select' && !force)) return;
      const selectMode = state.toolbar.visibleTools.select;
      const resetOption = state.options.settings.resetToSelect;
      if (
        shouldResetToSelect(
          activeTool,
          resetOption,
          toolAction?.opts as string | undefined,
        ) ||
        force === true
      )
        // example: 'paste'
        dispatch({
          type: 'ACTION',
          action: (acts as Record<string, { action: UiActionAction }>)[
            selectMode
          ].action,
        });
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
    onElementEdit: (selem: Atom | Atom[]) => {
      if (isAtomsArray(selem)) {
        const atomsArray = selem as unknown as Atom[];
        const atomAttributes = generateCommonProperties(
          atomsArray,
          fromAtom(atomsArray[0]),
        );
        return openDialog(dispatch, 'atomProps', {
          ...atomAttributes,
          isMultipleAtoms: true,
        }).then((res) => toElement(res as ElementFormData));
      }
      const singleElem = selem as Atom & { type?: string };
      const elem =
        singleElem.type === 'text'
          ? (selem as unknown as ElementFormData)
          : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            fromElement(selem as Atom)!;
      let dlg: Promise<unknown>;
      if ((elem as ElementFormData).type === 'text') {
        // TODO: move textdialog opening logic to another place
        return openDialog(dispatch, 'text', elem as Record<string, unknown>);
      } else if (Elements.get((elem as ElementFormData).label ?? '')) {
        dlg = openDialog(
          dispatch,
          'atomProps',
          elem as Record<string, unknown>,
        );
      } else if (
        Object.keys(elem as object).length === 1 &&
        'ap' in (elem as object)
      ) {
        dlg = openDialog(
          dispatch,
          'attachmentPoints',
          (elem as ElementFormData).ap as Record<string, unknown>,
        ).then((res) => ({ ap: res }));
      } else if ((elem as ElementFormData).type === 'rlabel') {
        const rgroups = getState().editor.struct().rgroups;
        const params = {
          type: 'atom',
          values: (elem as ElementFormData).values,
          disabledIds: Array.from(rgroups.entries()).reduce<number[]>(
            (acc, [rgid, rg]) => {
              if (rg.frags.has((elem as ElementFormData).fragId as number))
                acc.push(rgid);
              return acc;
            },
            [],
          ),
        };
        dlg = openDialog(dispatch, 'rgroup', params).then((res) => ({
          values: (res as { values: unknown[] }).values,
          type: 'rlabel',
        }));
      } else {
        // list/not-list and all other pseudo elements share this dialog flow
        dlg = openDialog(
          dispatch,
          !(elem as ElementFormData).pseudo ? 'period-table' : 'extended-table',
          {
            ...(elem as Record<string, unknown>),
            pseudo: (elem as ElementFormData).pseudo,
          },
        );
      }
      return dlg.then((res) => toElement(res as ElementFormData));
    },

    // TODO: correct
    onEnhancedStereoEdit: (params: { stereoLabel: string | null }) =>
      sleep(0).then(() => {
        const init = fromStereoLabel(params.stereoLabel);
        return openDialog(dispatch, 'enhancedStereo', {
          init,
        }).then(
          (res) => toStereoLabel(res as ReturnType<typeof fromStereoLabel>),
          () => null,
        );
      }),

    onQuickEdit: (atom: Atom) =>
      openDialog(
        dispatch,
        'labelEdit',
        atom as unknown as Record<string, unknown>,
      ),
    onBondEdit: (bonds: Bond[]) => {
      const bondsAttributes = generateCommonProperties(bonds, bonds[0]);
      return openDialog(
        dispatch,
        'bondProps',
        fromBond(bondsAttributes as unknown as Bond) as Record<string, unknown>,
      ).then((res) => toBond(res as ReturnType<typeof fromBond>));
    },
    onRgroupEdit: (rgroup: RGroupEditParams) => {
      const struct = getState().editor.struct();

      if (Object.keys(rgroup).length > 2) {
        const rgroupLabels = Array.from(struct.rgroups.keys());
        if (!rgroup.range) rgroup.range = '>0';

        return openDialog(dispatch, 'rgroupLogic', {
          rgroupLabels,
          ...rgroup,
        } as Record<string, unknown>);
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
      return openDialog(dispatch, 'rgroup', params).then((res) => ({
        label: (res as { values: unknown[] }).values[0],
      }));
    },
    onSgroupEdit: (sgroup: SGroupInput) =>
      sleep(0) // hack to open dialog after dispatch sgroup tool action
        .then(() =>
          openDialog(dispatch, 'sgroup', {
            ...(fromSgroup(sgroup) as Record<string, unknown>),
            selectedSruCount: getSelectedSruCount(sgroup.type),
          }),
        )
        .then((res) => toSgroup(res as SGroupFormData)),
    onRemoveFG: (result: Record<string, unknown>) =>
      sleep(0).then(() => openDialog(dispatch, 'removeFG', result)),
    onEditMonomer: (payload: EditMonomerPayload) =>
      sleep(0).then(() =>
        openDialog(
          dispatch,
          'editMonomer',
          payload as unknown as Record<string, unknown>,
        ),
      ),
    onMessage: (msg: { error?: unknown }) => {
      if (msg.error) {
        // TODO: add error handler call
      }
    },
    onAromatizeStruct: (struct: Struct) => {
      const state = getState();
      const serverOpts = state.options.getServerSettings();
      return serverCall(
        state.editor,
        state.server,
        'aromatize',
        serverOpts,
        struct,
      ).catch((e: unknown) => {
        KetcherLogger.error('index.ts::initEditor::onAromatizeStruct', e);
        state.editor.errorHandler?.(String(e));
      });
    },
    onDearomatizeStruct: (struct: Struct) => {
      const state = getState();
      const serverOpts = state.options.getServerSettings();
      return serverCall(
        state.editor,
        state.server,
        'dearomatize',
        serverOpts,
        struct,
      ).catch((e: unknown) => {
        KetcherLogger.error('index.ts::initEditor::onDearomatizeStruct', e);
        state.editor.errorHandler?.(String(e));
      });
    },
    onMouseDown: () => {
      updateAction();
    },
    onConfirm: (payload: Record<string, unknown>) =>
      openDialog(dispatch, 'confirm', payload),
    onShowInfo: (payload: ShowInfoPayload | null | undefined) => {
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
