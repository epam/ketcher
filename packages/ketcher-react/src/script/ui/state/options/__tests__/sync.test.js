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
    const coreSettings = {
      editor: { resetToSelect: true, rotationStep: 15 },
      render: { atomColoring: false, bondThickness: 1.2 },
      server: { 'smart-layout': true },
      debug: { showAtomIds: false },
      miew: { miewMode: 'LN' },
      macromolecules: { selectionTool: 'lasso' },
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.type).toBe('SYNC_SETTINGS_FROM_CORE');
    expect(action.data).toBeDefined();
  });

  it('should flatten namespaced settings to flat format', () => {
    const coreSettings = {
      editor: {
        resetToSelect: true,
        rotationStep: 15,
        showValenceWarnings: true,
        atomColoring: true,
      },
      render: {
        font: '30px Arial',
        fontsz: 12,
        atomColoring: false,
        bondThickness: 1.2,
      },
      server: {
        'smart-layout': true,
        'ignore-stereochemistry-errors': true,
      },
      debug: {
        showAtomIds: false,
        showBondIds: false,
      },
      miew: {
        miewMode: 'LN',
        miewTheme: 'light',
      },
      macromolecules: {
        selectionTool: 'lasso',
        editorLineLength: 50,
      },
    };

    const action = syncSettingsFromCore(coreSettings);
    const flatSettings = action.data;

    // Check editor settings are flattened
    expect(flatSettings.resetToSelect).toBe(true);
    expect(flatSettings.rotationStep).toBe(15);
    expect(flatSettings.showValenceWarnings).toBe(true);

    // Check render settings are flattened
    expect(flatSettings.font).toBe('30px Arial');
    expect(flatSettings.fontsz).toBe(12);
    expect(flatSettings.bondThickness).toBe(1.2);

    // Check server settings are flattened
    expect(flatSettings['smart-layout']).toBe(true);
    expect(flatSettings['ignore-stereochemistry-errors']).toBe(true);

    // Check debug settings are flattened
    expect(flatSettings.showAtomIds).toBe(false);
    expect(flatSettings.showBondIds).toBe(false);

    // Check miew settings are flattened
    expect(flatSettings.miewMode).toBe('LN');
    expect(flatSettings.miewTheme).toBe('light');

    // Check macromolecules settings are flattened
    expect(flatSettings.selectionTool).toBe('lasso');
    expect(flatSettings.editorLineLength).toBe(50);
  });

  it('should handle settings with all categories', () => {
    const coreSettings = {
      editor: { resetToSelect: false },
      render: { atomColoring: true },
      server: { 'smart-layout': false },
      debug: { showAtomIds: true },
      miew: { miewMode: 'BS' },
      macromolecules: { selectionTool: 'rectangle' },
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.data.resetToSelect).toBe(false);
    expect(action.data.atomColoring).toBe(true);
    expect(action.data['smart-layout']).toBe(false);
    expect(action.data.showAtomIds).toBe(true);
    expect(action.data.miewMode).toBe('BS');
    expect(action.data.selectionTool).toBe('rectangle');
  });

  it('should handle empty categories', () => {
    const coreSettings = {
      editor: {},
      render: {},
      server: {},
      debug: {},
      miew: {},
      macromolecules: {},
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.type).toBe('SYNC_SETTINGS_FROM_CORE');
    expect(action.data).toBeDefined();
  });

  it('should preserve all setting values including false and 0', () => {
    const coreSettings = {
      editor: { resetToSelect: false, rotationStep: 0 },
      render: { atomColoring: false, bondThickness: 0 },
      server: { 'smart-layout': false },
      debug: { showAtomIds: false },
      miew: { miewMode: '' },
      macromolecules: { editorLineLength: 0 },
    };

    const action = syncSettingsFromCore(coreSettings);

    expect(action.data.resetToSelect).toBe(false);
    expect(action.data.rotationStep).toBe(0);
    expect(action.data.atomColoring).toBe(false);
    expect(action.data.bondThickness).toBe(0);
    expect(action.data['smart-layout']).toBe(false);
    expect(action.data.showAtomIds).toBe(false);
    expect(action.data.miewMode).toBe('');
    expect(action.data.editorLineLength).toBe(0);
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
