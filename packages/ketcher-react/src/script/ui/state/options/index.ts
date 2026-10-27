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
import {
  KETCHER_SAVED_OPTIONS_KEY,
  KetcherLogger,
  ketcherProvider,
  normalizeSettingsForCore,
  normalizeSettingsForForm,
  type Settings,
  type SettingsFormValue,
} from 'ketcher-core';
import { pick } from 'lodash/fp';
import type { Dispatch, UnknownAction } from 'redux';
import { storage } from '../../storage-ext';
import { reinitializeTemplateLibrary } from '../templates/init-lib';
import { APP_OPTIONS_ACTION, OPTIONS_UPDATE_ACTION } from './actions';
import type {
  AnalyseRoundName,
  OptionsAction,
  OptionsState,
  RecognizeActionType,
  RecognizeImageFile,
} from './types';

function readSettings(): SettingsFormValue {
  return Object.assign(
    getDefaultOptions(),
    validation(storage.getItem(KETCHER_SAVED_OPTIONS_KEY)),
  ) as SettingsFormValue;
}

export const initOptionsState: OptionsState = {
  app: {
    server: false,
    templates: false,
    functionalGroups: false,
    saltsAndSolvents: false,
    buildDate: '',
    version: '',
    imagoVersions: [],
  },
  analyse: {
    values: null,
    loading: false,
    roundWeight: 3,
    roundMass: 3,
    roundElAnalysis: 1,
  },
  check: {
    checkOptions: [
      'valence',
      'radicals',
      'isotopes',
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
  settings: readSettings(),
  getSettings() {
    this.settings = readSettings();
  },
  getServerSettings() {
    const serializedServerOptions = getSerializedServerOptions(this.settings);
    const defaultServerOptions = pick(SERVER_OPTIONS, this.settings);

    return {
      ...defaultServerOptions,
      ...serializedServerOptions,
    };
  },
};

function getSerializedServerOptions(
  options: SettingsFormValue,
): Record<string, unknown> {
  let renderStereoStyle: string;
  if (!options.showStereoFlags) {
    renderStereoStyle = 'none';
  } else if (options.ignoreChiralFlag) {
    renderStereoStyle = 'ext';
  } else {
    renderStereoStyle = 'old';
  }

  let newOptions: Record<string, unknown> = {
    'render-coloring': options.atomColoring,
    'render-font-size': options.fontsz,
    'render-font-size-unit': options.fontszUnit,
    'render-font-size-sub': options.fontszsub,
    'render-font-size-sub-unit': options.fontszsubUnit,
    'image-resolution': Number(options.imageResolution),
    'bond-length': options.bondLength,
    'bond-length-unit': options.bondLengthUnit,
    'render-bond-thickness': options.bondThickness,
    'render-bond-thickness-unit': options.bondThicknessUnit,
    'render-bond-spacing': Number(options.bondSpacing) / 100,
    'render-stereo-bond-width': options.stereoBondWidth,
    'render-stereo-bond-width-unit': options.stereoBondWidthUnit,
    'render-hash-spacing': options.hashSpacing,
    'render-hash-spacing-unit': options.hashSpacingUnit,
    'reaction-component-margin-size': options.reactionComponentMarginSize,
    'reaction-component-margin-size-unit':
      options.reactionComponentMarginSizeUnit,
    'render-stereo-style': renderStereoStyle,
  };

  if (options.imageResolution === '600') {
    newOptions = {
      ...newOptions,
      // TODO: change to the values from settings once they are implemented
      'render-output-sheet-width': 11,
      'render-output-sheet-height': 8.5,
    };
  }

  return newOptions;
}

export function appUpdate(data: Partial<OptionsState['app']>) {
  return (dispatch: Dispatch<UnknownAction>) => {
    dispatch({ type: APP_OPTIONS_ACTION, data });
    dispatch({ type: OPTIONS_UPDATE_ACTION });
  };
}

/* SETTINGS */
export function saveSettings(
  newSettings: SettingsFormValue,
  ketcherId?: string,
) {
  return async (dispatch: Dispatch<UnknownAction>): Promise<void> => {
    const settingsService =
      ketcherProvider.getKetcher(ketcherId)?.settingsService;

    if (settingsService) {
      try {
        const transformedSettings = normalizeSettingsForCore(newSettings);
        await settingsService.updateSettings(transformedSettings);
      } catch (error: unknown) {
        KetcherLogger.error(
          'Failed to update settings via core service:',
          error,
        );
        storage.setItem(KETCHER_SAVED_OPTIONS_KEY, newSettings);
      }
    } else {
      storage.setItem(KETCHER_SAVED_OPTIONS_KEY, newSettings);
    }

    reinitializeTemplateLibrary();
    initOptionsState.getSettings();

    dispatch({
      type: 'SAVE_SETTINGS',
      data: newSettings,
    });
  };
}

/**
 * Sync settings from ketcher-core SettingsService to Redux
 * Used for backward compatibility - Redux becomes a passive consumer
 */
export function syncSettingsFromCore(coreSettings: Partial<Settings>) {
  const normalizedSettings = normalizeSettingsForForm(coreSettings, {
    removeCoreOnlyFields: true,
  });
  const defaultOptionNames = Object.keys(getDefaultOptions()) as Array<
    keyof SettingsFormValue
  >;
  const reduxSettings = pick(
    defaultOptionNames,
    normalizedSettings,
  ) as SettingsFormValue;

  return {
    type: 'SYNC_SETTINGS_FROM_CORE',
    data: reduxSettings,
  };
}

/* ANALYZE */
export function changeRound(
  roundName: AnalyseRoundName,
  value: number | string,
) {
  return {
    type: 'CHANGE_ANALYSE',
    data: { [roundName]: value },
  };
}

/* RECOGNIZE */
const recognizeActions: readonly RecognizeActionType[] = [
  'SET_RECOGNIZE_STRUCT',
  'CHANGE_RECOGNIZE_FILE',
  'CHANGE_IMAGO_VERSION',
  'IS_FRAGMENT_RECOGNIZE',
];

export function setStruct(str: string | Promise<unknown> | null) {
  return {
    type: 'SET_RECOGNIZE_STRUCT',
    data: { structStr: str },
  };
}

export function changeVersion(version: string | null) {
  return {
    type: 'CHANGE_IMAGO_VERSION',
    data: { version },
  };
}

export function changeImage(file: RecognizeImageFile) {
  return {
    type: 'CHANGE_RECOGNIZE_FILE',
    data: {
      file,
      structStr: null,
    },
  };
}

export function shouldFragment(isFrag: boolean) {
  return {
    type: 'IS_FRAGMENT_RECOGNIZE',
    data: { fragment: isFrag },
  };
}

/* CHECK */
export function checkOpts(data: OptionsState['check']) {
  return {
    type: 'SAVE_CHECK_OPTS',
    data,
  };
}

/* REDUCER */
function isOptionsAction<T extends OptionsAction['type']>(
  action: UnknownAction,
  type: T,
): action is Extract<OptionsAction, { type: T }> {
  return action.type === type;
}

function optionsReducer(
  state: OptionsState = initOptionsState,
  action: UnknownAction,
): OptionsState {
  if (isOptionsAction(action, APP_OPTIONS_ACTION)) {
    return { ...state, app: { ...state.app, ...action.data } };
  }

  if (isOptionsAction(action, 'SAVE_SETTINGS')) {
    return { ...state, settings: { ...state.settings, ...action.data } };
  }

  if (isOptionsAction(action, 'SYNC_SETTINGS_FROM_CORE')) {
    return { ...state, settings: { ...state.settings, ...action.data } };
  }

  if (isOptionsAction(action, 'SAVE_CHECK_OPTS')) {
    return { ...state, check: action.data };
  }

  if (isOptionsAction(action, 'CHANGE_ANALYSE')) {
    return {
      ...state,
      analyse: { ...state.analyse, ...action.data, loading: false },
    };
  }

  if (action.type === 'ANALYSE_LOADING') {
    return { ...state, analyse: { ...state.analyse, loading: true } };
  }

  if (
    recognizeActions.includes(action.type as RecognizeActionType) &&
    isOptionsAction(action, action.type as RecognizeActionType)
  ) {
    return { ...state, recognize: { ...state.recognize, ...action.data } };
  }

  return state;
}

export default optionsReducer;
