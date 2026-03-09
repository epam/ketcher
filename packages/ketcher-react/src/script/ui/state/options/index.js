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

/**
 * Transform settings from Redux format to SettingsService format
 * Fixes type mismatches and removes extra fields
 */
function transformSettingsForCore(settings) {
  const transformed = { ...settings };

  // Remove fields that don't belong in SettingsService
  delete transformed.init;

  // Fix imageResolution: string -> number
  // Form uses enum: ImageResolution.low = '72', ImageResolution.high = '600'
  // Schema expects: type 'number'
  if (typeof transformed.imageResolution === 'string') {
    transformed.imageResolution = parseInt(transformed.imageResolution, 10);
  }

  // Fix stereoLabelStyle: normalize to schema-expected values
  // Form enum (StereLabelStyleType): 'Iupac', 'Classic', 'On', 'Off'
  // Schema expects: ['IUPAC', 'classic', 'On-Atoms', 'off']
  // Note: There's a legacy mismatch between enum and schema that we need to handle
  if (transformed.stereoLabelStyle) {
    const style = transformed.stereoLabelStyle.toLowerCase();
    if (style === 'iupac') {
      transformed.stereoLabelStyle = 'IUPAC';
    } else if (style === 'classic') {
      transformed.stereoLabelStyle = 'classic';
    } else if (style === 'on' || style === 'on-atoms') {
      // Handle both 'On' from enum and 'On-Atoms' from schema
      transformed.stereoLabelStyle = 'On-Atoms';
    } else if (style === 'off') {
      transformed.stereoLabelStyle = 'off';
    }
  }

  // Fix showHydrogenLabels: legacy 'all' value -> 'On'
  // Form enum: ShowHydrogenLabels.On = 'all'
  // Schema expects: 'On'
  if (transformed.showHydrogenLabels === 'all') {
    transformed.showHydrogenLabels = 'On';
  }

  return transformed;
}

/**
 * Transform settings from SettingsService format to Redux format
 * Reverse transformation for display in the Settings dialog
 */
function transformSettingsFromCore(settings) {
  const transformed = { ...settings };

  // Convert imageResolution: number -> string (for form display)
  if (typeof transformed.imageResolution === 'number') {
    transformed.imageResolution = transformed.imageResolution.toString();
  }

  // Convert stereoLabelStyle: Reverse the transformation for form compatibility
  // Schema values: ['IUPAC', 'classic', 'On-Atoms', 'off']
  // Form enum (StereLabelStyleType): 'Iupac', 'Classic', 'On', 'Off'
  if (transformed.stereoLabelStyle) {
    const style = transformed.stereoLabelStyle;
    if (style === 'IUPAC') {
      transformed.stereoLabelStyle = 'Iupac';
    } else if (style === 'classic') {
      transformed.stereoLabelStyle = 'Classic';
    } else if (style === 'On-Atoms') {
      transformed.stereoLabelStyle = 'On';
    } else if (style === 'off') {
      transformed.stereoLabelStyle = 'Off';
    }
  }

  // Convert showHydrogenLabels: 'On' -> 'all' if needed
  // This might not be necessary since form uses 'On', but kept for safety
  // Form enum: ShowHydrogenLabels.On = 'all'
  // (Actually, the form should already handle 'On' correctly)

  // Remove fields that Redux doesn't use
  delete transformed.selectionTool;
  delete transformed.editorLineLength;
  delete transformed.disableCustomQuery;
  delete transformed.monomerLibraryUpdates;

  return transformed;
}

/* SETTINGS */
export function saveSettings(newSettings) {
  return async (dispatch, getState) => {
    // Try to update via ketcher-core settings service if available
    // Use window.ketcher since Redux state doesn't store the Ketcher instance
    const settingsService = window.ketcher?.settingsService;

    if (settingsService) {
      try {
        // Transform settings to match SettingsService schema
        const transformedSettings = transformSettingsForCore(newSettings);

        // Direct update - both Core and Redux use flat format now
        await settingsService.updateSettings(transformedSettings);
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
 * Sync settings from ketcher-core SettingsService to Redux
 * Used for backward compatibility - Redux becomes a passive consumer
 * @param {Settings} coreSettings - Settings from ketcher-core in flat format
 */
export function syncSettingsFromCore(coreSettings) {
  // Transform from SettingsService format to Redux format
  const reduxSettings = transformSettingsFromCore(coreSettings);
  return {
    type: 'SYNC_SETTINGS_FROM_CORE',
    data: reduxSettings,
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
