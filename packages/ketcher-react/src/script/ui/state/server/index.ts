/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
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
  type Struct,
  type CheckResult,
  type LayoutResult,
} from 'ketcher-core';
import { appUpdate } from '../options/actions';
import { setStruct } from '../options';
import { omit, without } from 'lodash/fp';

import { checkErrors } from '../modal/form';
import { indigoVerification } from '../request';
import { load } from '../shared';

import type { AppDispatch } from '../hooks';
import type {
  AppThunk,
  AutomapRequest,
  KetcherCheckErrors,
  ServerTransformMethod,
  StoreState,
} from '../store.types';
import type { CheckOption, ServerSettings } from '../options/types';
import type Editor from 'src/script/editor';
import type { Api } from 'src/script/api';

export function checkServer() {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    const { editor, server } = getState();

    server.then(
      (resource) =>
        dispatch(
          appUpdate({
            indigoVersion: resource?.indigoVersion,
            imagoVersions: resource?.imagoVersions,
            server: resource?.isAvailable,
          }),
        ),
      (error: unknown) => {
        editor?.errorHandler?.(String(error));
      },
    );
  };
}

export function recognize(file: File | null, version: string) {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    const { server, editor } = getState();
    const rec = server.recognize;

    const process = rec(file as Blob, version).then(
      (resource) => {
        dispatch(setStruct(resource.struct));
      },
      (error) => {
        dispatch(setStruct(null));
        editor?.errorHandler?.(String(error));
      },
    );
    dispatch(setStruct(process));
  };
}

function ketcherCheck(struct: Struct, checkParameters: CheckOption[]) {
  const errors: KetcherCheckErrors = {};

  if (checkParameters.includes('chiral_flag')) {
    const isAbs = Array.from(struct.frags.values()).some(
      (fr) => (fr?.enhancedStereoFlag as string | undefined) === 'abs',
    );
    if (isAbs) errors.chiral_flag = 'Chiral flag is present on the canvas';
  }

  if (checkParameters.includes('valence')) {
    let badValue = 0;
    struct.atoms.forEach((atom) => {
      if (atom.badConn) {
        badValue++;
      }
    });
    if (badValue > 0) {
      errors.valence = `Structure contains ${badValue} atom${
        badValue === 1 ? '' : 's'
      } with bad valence`;
    }
  }

  return errors;
}

export function check(optionsTypes: CheckOption[]): AppThunk<Promise<void>> {
  return (dispatch: AppDispatch, getState: () => StoreState) => {
    const { editor, server } = getState();
    const struct = editor.struct();

    // recalculate implicit hydrogens before validation
    // because for atoms in collapsed sgroups it can be not calculated
    struct.setImplicitHydrogen(undefined, true);

    const ketcherErrors = ketcherCheck(struct, optionsTypes);

    const options = getState().options.getServerSettings();
    options.data = { types: without(['valence', 'chiral_flag'], optionsTypes) };

    return serverCall<CheckResult>(editor, server, 'check', options)
      .then((resource) => {
        resource = Object.assign(resource, ketcherErrors); // merge Indigo check with Ketcher check
        dispatch(checkErrors(resource));
      })
      .catch((error) => {
        KetcherLogger.error('index.js::check', error);
        editor?.errorHandler?.(String(error));
      });
  };
}

export function automap(resource: AutomapRequest) {
  return serverTransform('automap', resource);
}

export function analyse(): AppThunk {
  return (dispatch, getState) => {
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
      .catch((error) => {
        KetcherLogger.error('index.js::analyse', error);
        editor?.errorHandler?.(String(error));
      });
  };
}

export function serverTransform(
  method: ServerTransformMethod,
  data: Record<string, unknown> = {},
  struct?: Struct,
) {
  return (dispatch: AppDispatch, getState: () => StoreState): void => {
    const state = getState();
    const options = state.options.getServerSettings();

    options.data = data;
    dispatch(indigoVerification(true));

    serverCall<LayoutResult>(
      state.editor,
      state.server,
      method,
      options,
      struct,
    )
      .then((resource) => {
        const loadedStruct = new KetSerializer().deserialize(resource.struct);

        return dispatch(
          load(loadedStruct, {
            preserveViewport:
              method === 'aromatize' || method === 'dearomatize',
            reactionRelayout: method === 'clean',
            method,
          }),
        );
      })
      .catch((error) => {
        KetcherLogger.error('index.js::serverTransform', error);
        state.editor?.errorHandler?.(String(error));
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
export function serverCall<T>(
  editor: Editor,
  server: Api,
  method: ServerTransformMethod,
  options: ServerSettings,
  struct?: Struct,
): Promise<T> {
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

  const call = server[method] as unknown as (
    data: { struct: string; [key: string]: unknown },
    options?: Record<string, unknown>,
  ) => Promise<T>;

  const request: { struct: string; [key: string]: unknown } = {
    struct: serializedStruct,
    ...(method === 'calculate' || method === 'check'
      ? {}
      : { output_format: ChemicalMimeType.KET }),
    ...(selectedAtoms.length > 0 ? { selected: selectedAtoms } : {}),
    ...(options.data ?? {}),
  };

  return server.then(() => call(request, omit('data', options)));
}
