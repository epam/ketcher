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
  ChemicalMimeType,
  KetcherLogger,
  KetSerializer,
  Struct,
} from 'ketcher-core';
import { appUpdate } from '../options/actions';
import { setStruct } from '../options';
import { omit, without } from 'lodash/fp';

import { checkErrors } from '../modal/form';
import { indigoVerification } from '../request';
import { load } from '../shared';

import type { AppDispatch } from '../hooks';
import type {
  AutomapRequest,
  KetcherCheckErrors,
  ServerTransformMethod,
  StoreState,
} from '../store.types';
import type { CheckOption, ServerSettings } from '../options/types';
import Editor from 'src/script/editor';
import { Api } from 'src/script/api';
import { StereoFlag } from 'ketcher-core';

export function checkServer() {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    const { editor, server } = getState();

    server.then(
      (res) =>
        dispatch(
          appUpdate({
            indigoVersion: res?.indigoVersion,
            imagoVersions: res?.imagoVersions,
            server: res?.isAvailable,
          }),
        ),
      (e: unknown) => {
        if (editor?.errorHandler) {
          editor.errorHandler(e instanceof Error ? e.message : String(e));
        }
      },
    );
  };
}

export function recognize(file: File | null, version: string) {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    const { server, editor } = getState();
    const rec = server.recognize;

    const process = rec(file as Blob, version).then(
      (res) => {
        dispatch(setStruct(res.struct));
      },
      (e) => {
        dispatch(setStruct(null));
        if (editor?.errorHandler) {
          editor.errorHandler(e instanceof Error ? e.message : String(e));
        }
      },
    );
    dispatch(setStruct(process));
  };
}

function ketcherCheck(struct: Struct, checkParams: CheckOption[]) {
  const errors: KetcherCheckErrors = {};

  if (checkParams.includes('chiral_flag')) {
    const isAbs = Array.from(struct.frags.values()).some(
      (fr) => fr?.enhancedStereoFlag === StereoFlag.Abs,
    );
    if (isAbs) errors.chiral_flag = 'Chiral flag is present on the canvas';
  }

  if (checkParams.includes('valence')) {
    let badVal = 0;
    struct.atoms.forEach((atom) => {
      if (atom.badConn) {
        badVal++;
      }
    });
    if (badVal > 0) {
      errors.valence = `Structure contains ${badVal} atom${
        badVal !== 1 ? 's' : ''
      } with bad valence`;
    }
  }

  return errors;
}

export function check(optsTypes: CheckOption[]) {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    const { editor, server } = getState();
    if (!editor) return;
    const struct = editor.struct();

    // recalculate implicit hydrogens before validation
    // because for atoms in collapsed sgroups it can be not calculated
    struct.setImplicitHydrogen(undefined, true);

    const ketcherErrors = ketcherCheck(struct, optsTypes);

    const options = getState().options.getServerSettings();
    options.data = { types: without(['valence', 'chiral_flag'], optsTypes) };

    return serverCall(editor, server, 'check', options)
      .then((res) => {
        res = Object.assign(res, ketcherErrors); // merge Indigo check with Ketcher check
        dispatch(checkErrors(res));
      })
      .catch((e) => {
        KetcherLogger.error('index.js::check', e);
        if (editor?.errorHandler) {
          editor.errorHandler(e instanceof Error ? e.message : String(e));
        }
      });
  };
}

export function automap(res: AutomapRequest) {
  return serverTransform('automap', res);
}

export function analyse() {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    // reset values to initial state
    dispatch({
      type: 'ANALYSE_LOADING',
    });
    const { editor, server, options } = getState();
    const serverSettings = options.getServerSettings();
    serverSettings.data = {
      properties: [
        'molecular-weight',
        'most-abundant-mass',
        'monoisotopic-mass',
        'gross',
        'mass-composition',
      ],
    };

    return serverCall(editor, server, 'calculate', serverSettings)
      .then((values) =>
        dispatch({
          type: 'CHANGE_ANALYSE',
          data: { values },
        }),
      )
      .catch((e) => {
        KetcherLogger.error('index.js::analyse', e);
        if (editor?.errorHandler) {
          editor.errorHandler(e instanceof Error ? e.message : String(e));
        }
      });
  };
}

export function serverTransform(
  method: ServerTransformMethod,
  data: Record<string, unknown>,
  struct?: Struct,
) {
  return (dispatch: AppDispatch, getState: () => StoreState): void => {
    const state = getState();
    const opts = state.options.getServerSettings();

    opts.data = data;
    dispatch(indigoVerification(true));

    serverCall(state.editor, state.server, method, opts, struct)
      .then((res) => {
        const loadedStruct = new KetSerializer().deserialize(res.struct);

        return dispatch(
          load(loadedStruct, {
            preserveViewport:
              method === 'aromatize' || method === 'dearomatize',
            reactionRelayout: method === 'clean',
            method,
          }),
        );
      })
      .catch((e) => {
        KetcherLogger.error('index.js::serverTransform', e);
        if (state.editor?.errorHandler) {
          state.editor.errorHandler(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        dispatch(indigoVerification(false));
      });
    // TODO: notification
  };
}

/*
  Indigo doesn't perform layout for enhancedFlags and just preserves their positions
  That results in structure being aligned and moved, but flags left as is.
*/
function resetStereoFlagsPosition(struct: Struct): void {
  struct.frags.forEach((fragment) => {
    if (fragment) {
      fragment.stereoFlagPosition = undefined;
    }
  });
}

// TODO: serverCall function should not be exported
export function serverCall(
  editor: Editor,
  server: Api,
  method: ServerTransformMethod,
  options: ServerSettings,
  struct?: Struct,
) {
  const selection = editor.selection();

  let selectedAtoms: number[] = [];
  let selectedBonds: number[] = [];

  const aidMap = new Map<number, number>();
  const bidMap = new Map<number, number>();

  const currentStruct = (struct || editor.struct()).clone(
    null,
    null,
    false,
    aidMap,
    null,
    null,
    null,
    null,
    null,
    bidMap,
  );

  const expSel = editor.explicitSelected();

  if (selection) {
    selectedAtoms = (selection.atoms ?? expSel.atoms ?? [])
      .map((aid) => aidMap.get(aid))
      .filter((aid): aid is number => aid !== undefined);

    selectedBonds = (selection.bonds ?? expSel.bonds ?? [])
      .map((bid) => bidMap.get(bid))
      .filter((bid): bid is number => bid !== undefined);
  }

  if (method === 'layout') {
    resetStereoFlagsPosition(currentStruct);
  }

  const ketSerializer = new KetSerializer();

  const serializedStruct = ketSerializer.serialize(currentStruct, undefined, {
    ...selection,
    atoms: selectedAtoms,
    bonds: selectedBonds,
  });

  return server.then((api) =>
    api[method](
      {
        struct: serializedStruct,
        ...(method !== 'calculate' && method !== 'check'
          ? { output_format: ChemicalMimeType.KET }
          : {}),

        ...(selectedAtoms.length > 0 ? { selected: selectedAtoms } : {}),

        ...(options.data ?? {}),
      },
      omit('data', options),
    ),
  );
}
