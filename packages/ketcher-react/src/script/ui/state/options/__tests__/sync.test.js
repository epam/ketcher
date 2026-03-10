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

import { syncSettingsFromCore } from '../index';

describe('syncSettingsFromCore', () => {
  it('should create SYNC_SETTINGS_FROM_CORE action', () => {
    // Settings are now FLAT - no nested editor/render/server categories
    const coreSettings = {
      resetToSelect: true,
      rotationStep: 15,
      atomColoring: false,
      bondThickness: 1.2,
      'smart-layout': true,
      showAtomIds: false,
      miewMode: 'LN',
      selectionTool: 'lasso',
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.type).toBe('SYNC_SETTINGS_FROM_CORE');
    expect(action.data).toBeDefined();
  });

  it('should transform settings from Core to Redux format', () => {
    // Settings from Core are FLAT (all properties at root level)
    const coreSettings = {
      resetToSelect: true,
      rotationStep: 15,
      showValenceWarnings: true,
      atomColoring: false, // Note: atomColoring at root level in flat structure
      font: '30px Arial',
      fontsz: 12,
      bondThickness: 1.2,
      'smart-layout': true,
      'ignore-stereochemistry-errors': true,
      showAtomIds: false,
      showBondIds: false,
      miewMode: 'LN',
      miewTheme: 'light',
      selectionTool: 'lasso',
      editorLineLength: { test: 50 },
    };

    const action = syncSettingsFromCore(coreSettings);
    const reduxSettings = action.data;

    // Check all settings are present
    expect(reduxSettings.resetToSelect).toBe(true);
    expect(reduxSettings.rotationStep).toBe(15);
    expect(reduxSettings.showValenceWarnings).toBe(true);
    expect(reduxSettings.atomColoring).toBe(false);
    expect(reduxSettings.font).toBe('30px Arial');
    expect(reduxSettings.fontsz).toBe(12);
    expect(reduxSettings.bondThickness).toBe(1.2);
    expect(reduxSettings['smart-layout']).toBe(true);
    expect(reduxSettings['ignore-stereochemistry-errors']).toBe(true);
    expect(reduxSettings.showAtomIds).toBe(false);
    expect(reduxSettings.showBondIds).toBe(false);
    expect(reduxSettings.miewMode).toBe('LN');
    expect(reduxSettings.miewTheme).toBe('light');

    // Macromolecules-specific settings should be removed (not needed in Redux)
    expect(reduxSettings.selectionTool).toBeUndefined();
    expect(reduxSettings.editorLineLength).toBeUndefined();
  });

  it('should handle complete flat settings', () => {
    // Settings are flat - no nested categories
    const coreSettings = {
      resetToSelect: false,
      atomColoring: true,
      'smart-layout': false,
      showAtomIds: true,
      miewMode: 'BS',
      selectionTool: 'rectangle',
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.data.resetToSelect).toBe(false);
    expect(action.data.atomColoring).toBe(true);
    expect(action.data['smart-layout']).toBe(false);
    expect(action.data.showAtomIds).toBe(true);
    expect(action.data.miewMode).toBe('BS');
    // selectionTool is removed by transformSettingsFromCore (macromolecules-only)
    expect(action.data.selectionTool).toBeUndefined();
  });

  it('should handle empty settings', () => {
    // Empty flat settings object
    const coreSettings = {};

    const action = syncSettingsFromCore(coreSettings);

    expect(action.type).toBe('SYNC_SETTINGS_FROM_CORE');
    expect(action.data).toBeDefined();
  });

  it('should preserve all setting values including false and 0', () => {
    // Flat settings with falsy values
    const coreSettings = {
      resetToSelect: false,
      rotationStep: 0,
      atomColoring: false,
      bondThickness: 0,
      'smart-layout': false,
      showAtomIds: false,
      miewMode: '',
      editorLineLength: { test: 0 },
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.data.resetToSelect).toBe(false);
    expect(action.data.rotationStep).toBe(0);
    expect(action.data.atomColoring).toBe(false);
    expect(action.data.bondThickness).toBe(0);
    expect(action.data['smart-layout']).toBe(false);
    expect(action.data.showAtomIds).toBe(false);
    expect(action.data.miewMode).toBe('');
    // editorLineLength is removed by transformSettingsFromCore (macromolecules-only)
    expect(action.data.editorLineLength).toBeUndefined();
  });
});

describe('Redux reducer - SYNC_SETTINGS_FROM_CORE', () => {
  // Import the reducer
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const optionsReducer = require('../index').default;

  it('should handle SYNC_SETTINGS_FROM_CORE action', () => {
    const initialState = {
      settings: {
        resetToSelect: true,
        rotationStep: 15,
        atomColoring: true,
      },
    };

    const action = {
      type: 'SYNC_SETTINGS_FROM_CORE',
      data: {
        resetToSelect: false,
        rotationStep: 30,
        atomColoring: false,
      },
    };

    const newState = optionsReducer(initialState, action);

    expect(newState.settings.resetToSelect).toBe(false);
    expect(newState.settings.rotationStep).toBe(30);
    expect(newState.settings.atomColoring).toBe(false);
  });

  it('should merge synced settings with existing settings', () => {
    const initialState = {
      settings: {
        resetToSelect: true,
        rotationStep: 15,
        atomColoring: true,
        existingProperty: 'should-remain',
      },
    };

    const action = {
      type: 'SYNC_SETTINGS_FROM_CORE',
      data: {
        resetToSelect: false,
      },
    };

    const newState = optionsReducer(initialState, action);

    expect(newState.settings.resetToSelect).toBe(false);
    expect(newState.settings.rotationStep).toBe(15); // Unchanged
    expect(newState.settings.atomColoring).toBe(true); // Unchanged
    expect(newState.settings.existingProperty).toBe('should-remain'); // Preserved
  });

  it('should not mutate original state', () => {
    const initialState = {
      settings: {
        resetToSelect: true,
      },
    };

    const originalSettings = initialState.settings;

    const action = {
      type: 'SYNC_SETTINGS_FROM_CORE',
      data: {
        resetToSelect: false,
      },
    };

    const newState = optionsReducer(initialState, action);

    expect(originalSettings.resetToSelect).toBe(true); // Original unchanged
    expect(newState.settings.resetToSelect).toBe(false);
    expect(newState.settings).not.toBe(originalSettings); // New object
  });
});
