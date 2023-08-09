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

import { ChemicalMimeType, KetSerializer } from 'ketcher-core';
import { appUpdate, setStruct } from '../options';
import { omit, without } from 'lodash/fp';

import { checkErrors } from '../modal/form';
import { indigoVerification } from '../request';
import { load } from '../shared';

export function checkServer() {
  return (dispatch, getState) => {
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
      (e) => editor.errorHandler(e),
    );
  };
}

export function recognize(file, version) {
  return (dispatch, getState) => {
    const rec = getState().server.recognize;
    const editor = getState().editor;

    const process = rec(file, version).then(
      (res) => {
        dispatch(setStruct(res.struct));
      },
      (e) => {
        dispatch(setStruct(null));
        editor.errorHandler(e);
      },
    );
    dispatch(setStruct(process));
  };
}

function ketcherCheck(struct, checkParams) {
  const errors = {};

  if (checkParams.includes('chiral_flag')) {
    const isAbs = Array.from(struct.frags.values()).some((fr) =>
      fr ? fr.enhancedStereoFlag === 'abs' : false,
    );
    if (isAbs) errors.chiral_flag = 'Chiral flag is present on the canvas';
  }

  if (checkParams.includes('valence')) {
    let badVal = 0;
    struct.atoms.forEach((atom) => atom.badConn && badVal++);
    if (badVal > 0)
      errors.valence = `Structure contains ${badVal} atom${
        badVal !== 1 ? 's' : ''
      } with bad valence`;
  }

  return errors;
}

export function check(optsTypes) {
  return (dispatch, getState) => {
    const { editor, server } = getState();
    const ketcherErrors = ketcherCheck(editor.struct(), optsTypes);

    const options = getState().options.getServerSettings();
    options.data = { types: without(['valence', 'chiral_flag'], optsTypes) };

    return serverCall(editor, server, 'check', options)
      .then((res) => {
        res = Object.assign(res, ketcherErrors); // merge Indigo check with Ketcher check
        dispatch(checkErrors(res));
      })
      .catch((e) => {
        editor.errorHandler(e);
      });
  };
}

export function automap(res) {
  return serverTransform('automap', res);
}

export function analyse() {
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
      .catch((e) => {
        editor.errorHandler(e);
      });
  };
}

export function serverTransform(method, data, struct) {
  return (dispatch, getState) => {
    const state = getState();
    const opts = state.options.getServerSettings();

    opts.data = data;
    dispatch(indigoVerification(true));

    serverCall(state.editor, state.server, method, opts, struct)
      .then((res) => {
        const loadedStruct = new KetSerializer().deserialize(res.struct);

        return dispatch(
          load(loadedStruct, {
            rescale: method === 'layout',
            reactionRelayout: method === 'clean',
          }),
        );
      })
      .catch((e) => {
        state.editor.errorHandler(e);
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
function resetStereoFlagsPosition(struct) {
  struct.frags.forEach((fragment) => (fragment.stereoFlagPosition = undefined));
}

// TODO: serverCall function should not be exported
export function serverCall(editor, server, method, options, struct) {
  const selection = editor.selection();
  let selectedAtoms = [];
  const aidMap = new Map();
  const currentStruct = (struct || editor.struct()).clone(
    null,
    null,
    false,
    aidMap,
  );
  if (selection) {
    selectedAtoms = (
      selection.atoms ? selection.atoms : editor.explicitSelected().atoms
    ).map((aid) => aidMap.get(aid));
  }
  if (method === 'layout') {
    resetStereoFlagsPosition(currentStruct);
  }
  const ketSerializer = new KetSerializer();
  return server.then(() =>
    server[method](
      Object.assign(
        {
          struct: ketSerializer.serialize(currentStruct),
        },
        method !== 'calculate' && method !== 'check'
          ? {
              output_format: ChemicalMimeType.KET,
            }
          : null,
        selectedAtoms && selectedAtoms.length > 0
          ? {
              selected: selectedAtoms,
            }
          : null,
        options.data,
      ),
      omit('data', options),
    ),
  );
}
