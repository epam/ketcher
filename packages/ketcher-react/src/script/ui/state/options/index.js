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
import { KETCHER_SAVED_OPTIONS_KEY } from 'ketcher-core';

import { pick } from 'lodash/fp';
import { storage } from '../../storage-ext';
import { reinitializeTemplateLibrary } from '../templates/init-lib';

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
  getSettings() {
    this.settings = Object.assign(
      getDefaultOptions(),
      validation(storage.getItem(KETCHER_SAVED_OPTIONS_KEY)),
    );
  },
  getServerSettings() {
    const seriliazedServerOptions = getSerilizedServerOptions(this.settings);
    const defaultServerOptions = pick(SERVER_OPTIONS, this.settings);

    return {
      ...defaultServerOptions,
      ...seriliazedServerOptions,
    };
  },
};

function getSerilizedServerOptions(options) {
  let renderStereoStyle;
  if (!options.showStereoFlags) {
    renderStereoStyle = 'none';
  } else if (options.ignoreChiralFlag) {
    renderStereoStyle = 'ext';
  } else {
    renderStereoStyle = 'old';
  }

  let newOptions = {
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
    'render-bond-spacing': options.bondSpacing / 100,
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

export function appUpdate(data) {
  return (dispatch) => {
    dispatch({ type: 'APP_OPTIONS', data });
    dispatch({ type: 'UPDATE' });
  };
}

/* SETTINGS */
export function saveSettings(newSettings) {
  return async (dispatch, getState) => {
    // Try to update via ketcher-core settings service if available
    const state = getState();
    const editor = state.editor;
    const ketcherInstance = editor?.ketcher;
    const settingsService = ketcherInstance?.settingsService;

    if (settingsService) {
      try {
        // Convert flat settings to namespaced format for core
        const namespacedSettings = convertFlatToNamespaced(newSettings);
        await settingsService.updateSettings(namespacedSettings);
        // Core service handles localStorage and emits events
        // The event will trigger syncSettingsFromCore via useSettings hook
      } catch (error) {
        console.error('Failed to update settings via core service:', error);
        // Fall back to direct localStorage write
        storage.setItem(KETCHER_SAVED_OPTIONS_KEY, newSettings);
      }
    } else {
      // No core service available, use legacy localStorage
      storage.setItem(KETCHER_SAVED_OPTIONS_KEY, newSettings);
    }

    // Reinitialize template library and update init state
    reinitializeTemplateLibrary();
    initOptionsState.getSettings();

    // Dispatch Redux action for backward compatibility
    dispatch({
      type: 'SAVE_SETTINGS',
      data: newSettings,
    });
  };
}

/**
 * Convert flat Redux settings to namespaced core format
 * @param {Object} flatSettings - Flat settings object from Redux
 * @returns {Object} Namespaced settings for ketcher-core
 */
function convertFlatToNamespaced(flatSettings) {
  // Define which keys belong to which namespace
  const editorKeys = ['resetToSelect', 'rotationStep', 'showValenceWarnings'];
  const renderKeys = [
    'atomColoring', // Moved from editorKeys - this is a render setting
    'font',
    'fontsz',
    'fontszUnit',
    'fontszsub',
    'fontszsubUnit',
    'bondLength',
    'bondLengthUnit',
    'bondThickness',
    'bondThicknessUnit',
    'bondSpacing',
    'stereoBondWidth',
    'stereoBondWidthUnit',
    'hashSpacing',
    'hashSpacingUnit',
    'aromaticCircle',
    'carbonExplicitly',
    'showCharge',
    'showValence',
    'showHydrogenLabels',
    'showStereoFlags',
    'stereoLabelStyle',
    'colorOfAbsoluteCenters',
    'colorOfAndCenters',
    'colorOfOrCenters',
    'colorStereogenicCenters',
    'autoFadeOfStereoLabels',
    'absFlagLabel',
    'andFlagLabel',
    'orFlagLabel',
    'mixedFlagLabel',
    'ignoreChiralFlag',
    'reactionComponentMarginSize',
    'reactionComponentMarginSizeUnit',
    'imageResolution',
  ];
  const serverKeys = [
    'smart-layout',
    'ignore-stereochemistry-errors',
    'mass-skip-error-on-pseudoatoms',
    'gross-formula-add-rsites',
    'gross-formula-add-isotopes',
    'dearomatize-on-load',
  ];
  const debugKeys = [
    'showAtomIds',
    'showBondIds',
    'showHalfBondIds',
    'showLoopIds',
  ];
  const miewKeys = ['miewMode', 'miewTheme', 'miewAtomLabel'];
  const macromoleculesKeys = [
    'selectionTool',
    'editorLineLength',
    'disableCustomQuery',
    'monomerLibraryUpdates',
    'ignoreChiralFlag',
  ];

  const namespaced = {};

  // Extract settings by category
  const editor = {};
  const render = {};
  const server = {};
  const debug = {};
  const miew = {};
  const macromolecules = {};

  for (const [key, value] of Object.entries(flatSettings)) {
    if (editorKeys.includes(key)) {
      editor[key] = value;
    } else if (renderKeys.includes(key)) {
      render[key] = value;
    } else if (serverKeys.includes(key)) {
      server[key] = value;
    } else if (debugKeys.includes(key)) {
      debug[key] = value;
    } else if (miewKeys.includes(key)) {
      miew[key] = value;
    } else if (macromoleculesKeys.includes(key)) {
      macromolecules[key] = value;
    }
  }

  if (Object.keys(editor).length > 0) namespaced.editor = editor;
  if (Object.keys(render).length > 0) namespaced.render = render;
  if (Object.keys(server).length > 0) namespaced.server = server;
  if (Object.keys(debug).length > 0) namespaced.debug = debug;
  if (Object.keys(miew).length > 0) namespaced.miew = miew;
  if (Object.keys(macromolecules).length > 0)
    namespaced.macromolecules = macromolecules;

  return namespaced;
}

/**
 * Sync settings from ketcher-core SettingsService to Redux
 * Used for backward compatibility - Redux becomes a passive consumer
 * @param {Settings} coreSettings - Settings from ketcher-core in namespaced format
 */
export function syncSettingsFromCore(coreSettings) {
  // Flatten namespaced settings to match Redux structure
  const flatSettings = {
    ...coreSettings.editor,
    ...coreSettings.render,
    ...coreSettings.server,
    ...coreSettings.debug,
    ...coreSettings.miew,
    ...coreSettings.macromolecules,
  };

  return {
    type: 'SYNC_SETTINGS_FROM_CORE',
    data: flatSettings,
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

  if (type === 'SYNC_SETTINGS_FROM_CORE') {
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
