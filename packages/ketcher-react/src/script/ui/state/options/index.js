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
  SERVER_OPTIONS,
  getDefaultOptions,
  validation,
} from '../../data/schema/options-schema';

import { pick } from 'lodash/fp';
import { storage } from '../../storage-ext';
import { reinitializeTemplateLibrary } from '../templates/init-lib';
import { KETCHER_SAVED_OPTIONS_KEY } from 'src/constants';

export const initOptionsState = {
  app: {
    server: false,
    templates: false,
    functionalGroups: false,
    saltsAndSolvents: false,
  },
  analyse: {
    values: null,
    roundWeight: 3,
    roundMass: 3,
    roundElAnalysis: 1,
  },
  check: {
    checkOptions: [
      'valence',
      'radicals',
      'pseudoatoms',
      'stereo',
      'query',
      'overlapping_atoms',
      'overlapping_bonds',
      'rgroups',
      'chiral',
      '3d',
      'chiral_flag',
    ],
  },
  recognize: {
    file: null,
    structStr: null,
    fragment: false,
    version: null,
  },
  settings: Object.assign(
    getDefaultOptions(),
    validation(storage.getItem(KETCHER_SAVED_OPTIONS_KEY)),
  ),
  getServerSettings() {
    return pick(SERVER_OPTIONS, this.settings);
  },
};

export function appUpdate(data) {
  return (dispatch) => {
    dispatch({ type: 'APP_OPTIONS', data });
    dispatch({ type: 'UPDATE' });
  };
}

/* SETTINGS */
export function saveSettings(newSettings) {
  storage.setItem(KETCHER_SAVED_OPTIONS_KEY, newSettings);
  reinitializeTemplateLibrary();

  return {
    type: 'SAVE_SETTINGS',
    data: newSettings,
  };
}

/* ANALYZE */
export function changeRound(roundName, value) {
  return {
    type: 'CHANGE_ANALYSE',
    data: { [roundName]: value },
  };
}

/* RECOGNIZE */
const recognizeActions = [
  'SET_RECOGNIZE_STRUCT',
  'CHANGE_RECOGNIZE_FILE',
  'CHANGE_IMAGO_VERSION',
  'IS_FRAGMENT_RECOGNIZE',
];

export function setStruct(str) {
  return {
    type: 'SET_RECOGNIZE_STRUCT',
    data: { structStr: str },
  };
}

export function changeVersion(version) {
  return {
    type: 'CHANGE_IMAGO_VERSION',
    data: { version },
  };
}

export function changeImage(file) {
  return {
    type: 'CHANGE_RECOGNIZE_FILE',
    data: {
      file,
      structStr: null,
    },
  };
}

export function shouldFragment(isFrag) {
  return {
    type: 'IS_FRAGMENT_RECOGNIZE',
    data: { fragment: isFrag },
  };
}

/* CHECK */
export function checkOpts(data) {
  return {
    type: 'SAVE_CHECK_OPTS',
    data,
  };
}

/* REDUCER */
function optionsReducer(state = {}, action) {
  const { type, data } = action;
  if (type === 'APP_OPTIONS')
    return { ...state, app: { ...state.app, ...data } };

  if (type === 'SAVE_SETTINGS') {
    return { ...state, settings: { ...state.settings, ...data } };
  }

  if (type === 'SAVE_CHECK_OPTS') return { ...state, check: data };

  if (type === 'CHANGE_ANALYSE')
    return { ...state, analyse: { ...state.analyse, ...data, loading: false } };

  if (type === 'ANALYSE_LOADING')
    return { ...state, analyse: { ...state.analyse, loading: true } };

  if (recognizeActions.includes(type))
    return { ...state, recognize: { ...state.recognize, ...data } };
  return state;
}

export default optionsReducer;
