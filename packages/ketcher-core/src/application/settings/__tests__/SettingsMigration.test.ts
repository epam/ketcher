/**
 * Unit tests for SettingsMigration
 * Tests migration from namespaced format back to flat format
 */

/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation */

import { SettingsMigration } from '../SettingsMigration';

describe('SettingsMigration', () => {
  describe('migrate', () => {
    it('should detect and return flat format unchanged', () => {
      const flatFormat = {
        resetToSelect: false,
        atomColoring: true,
        'smart-layout': true,
      };

      const migrated = SettingsMigration.migrate(flatFormat);

      expect(migrated).toEqual(flatFormat);
    });

    it('should migrate namespaced format to flat format', () => {
      const namespacedFormat = {
        editor: { resetToSelect: false, rotationStep: 30 },
        render: { atomColoring: true, bondThickness: 1.2 },
        server: { 'smart-layout': true },
        debug: { showAtomIds: false },
        miew: { miewMode: 'BS' },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      // Should be flattened
      expect(migrated).toEqual({
        resetToSelect: false,
        rotationStep: 30,
        atomColoring: true,
        bondThickness: 1.2,
        'smart-layout': true,
        showAtomIds: false,
        miewMode: 'BS',
      });
    });

    it('should handle null input', () => {
      const migrated = SettingsMigration.migrate(null);

      expect(migrated).toEqual({});
    });

    it('should handle undefined input', () => {
      const migrated = SettingsMigration.migrate(undefined);

      expect(migrated).toEqual({});
    });

    it('should handle non-object input', () => {
      const migrated = SettingsMigration.migrate('not an object' as any);

      expect(migrated).toEqual({});
    });

    it('should handle empty object', () => {
      const migrated = SettingsMigration.migrate({});

      expect(migrated).toEqual({});
    });
  });

  describe('migrate - editor settings', () => {
    it('should flatten editor settings', () => {
      const namespacedFormat = {
        editor: {
          resetToSelect: false,
          rotationStep: 30,
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        resetToSelect: false,
        rotationStep: 30,
      });
    });
  });

  describe('migrate - render settings', () => {
    it('should flatten render settings', () => {
      const namespacedFormat = {
        render: {
          atomColoring: false,
          bondThickness: 2.0,
          font: '30px Arial',
          showStereoFlags: true,
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        atomColoring: false,
        bondThickness: 2.0,
        font: '30px Arial',
        showStereoFlags: true,
      });
    });

    it('should flatten all render setting types', () => {
      const namespacedFormat = {
        render: {
          // Boolean
          atomColoring: true,
          showCharge: false,
          // Number
          bondThickness: 2.5,
          fontsz: 14,
          // String
          font: '30px Arial',
          colorOfAbsoluteCenters: '#ff0000',
          // Enum
          showHydrogenLabels: 'On',
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        atomColoring: true,
        showCharge: false,
        bondThickness: 2.5,
        fontsz: 14,
        font: '30px Arial',
        colorOfAbsoluteCenters: '#ff0000',
        showHydrogenLabels: 'On',
      });
    });
  });

  describe('migrate - server settings', () => {
    it('should flatten server settings with kebab-case keys', () => {
      const namespacedFormat = {
        server: {
          'smart-layout': true,
          'ignore-stereochemistry-errors': false,
          'dearomatize-on-load': true,
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        'smart-layout': true,
        'ignore-stereochemistry-errors': false,
        'dearomatize-on-load': true,
      });
    });
  });

  describe('migrate - debug settings', () => {
    it('should flatten debug settings', () => {
      const namespacedFormat = {
        debug: {
          showAtomIds: true,
          showBondIds: false,
          showHalfBondIds: true,
          showLoopIds: false,
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        showAtomIds: true,
        showBondIds: false,
        showHalfBondIds: true,
        showLoopIds: false,
      });
    });
  });

  describe('migrate - miew settings', () => {
    it('should flatten miew settings', () => {
      const namespacedFormat = {
        miew: {
          miewMode: 'BS',
          miewTheme: 'dark',
          miewAtomLabel: 'bright',
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        miewMode: 'BS',
        miewTheme: 'dark',
        miewAtomLabel: 'bright',
      });
    });
  });

  describe('migrate - macromolecules settings', () => {
    it('should flatten macromolecules settings', () => {
      const namespacedFormat = {
        macromolecules: {
          selectionTool: 'lasso',
          editorLineLength: { 'sequence-layout-mode': 30 },
          disableCustomQuery: true,
          monomerLibraryUpdates: ['update1', 'update2'],
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        selectionTool: 'lasso',
        editorLineLength: { 'sequence-layout-mode': 30 },
        disableCustomQuery: true,
        monomerLibraryUpdates: ['update1', 'update2'],
      });
    });
  });

  describe('migrate - comprehensive namespaced format', () => {
    it('should flatten complete namespaced settings', () => {
      const namespacedFormat = {
        editor: {
          resetToSelect: 'paste',
          rotationStep: 15,
        },
        render: {
          atomColoring: true,
          bondThickness: 1.2,
          font: '30px Arial',
        },
        server: {
          'smart-layout': true,
          'dearomatize-on-load': false,
        },
        debug: {
          showAtomIds: false,
          showBondIds: true,
        },
        miew: {
          miewMode: 'LN',
          miewTheme: 'light',
        },
        macromolecules: {
          selectionTool: 'rectangle',
        },
      };

      const migrated = SettingsMigration.migrate(namespacedFormat);

      expect(migrated).toEqual({
        resetToSelect: 'paste',
        rotationStep: 15,
        atomColoring: true,
        bondThickness: 1.2,
        font: '30px Arial',
        'smart-layout': true,
        'dearomatize-on-load': false,
        showAtomIds: false,
        showBondIds: true,
        miewMode: 'LN',
        miewTheme: 'light',
        selectionTool: 'rectangle',
      });
    });
  });

  describe('migrate - partial settings', () => {
    it('should flatten only present categories', () => {
      const partialNamespaced = {
        editor: { resetToSelect: false },
      };

      const migrated = SettingsMigration.migrate(partialNamespaced);

      expect(migrated).toEqual({ resetToSelect: false });
    });

    it('should handle empty categories', () => {
      const emptyCategories = {
        editor: {},
        render: {},
      };

      const migrated = SettingsMigration.migrate(emptyCategories);

      expect(migrated).toEqual({});
    });
  });

  describe('loadFromLegacyStorage', () => {
    let mockLocalStorage: { [key: string]: string };

    beforeEach(() => {
      mockLocalStorage = {};

      Object.defineProperty(global, 'localStorage', {
        value: {
          getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
          setItem: jest.fn((key: string, value: string) => {
            mockLocalStorage[key] = value;
          }),
          removeItem: jest.fn((key: string) => {
            delete mockLocalStorage[key];
          }),
        },
        writable: true,
        configurable: true,
      });
    });

    it('should load from ketcher-opts key and flatten if namespaced', () => {
      const testSettings = {
        editor: { resetToSelect: false },
        render: { atomColoring: true },
      };

      mockLocalStorage['ketcher-opts'] = JSON.stringify(testSettings);

      const loaded = SettingsMigration.loadFromLegacyStorage();

      expect(loaded).toBeDefined();
      expect(loaded).toEqual({
        resetToSelect: false,
        atomColoring: true,
      });
    });

    it('should load flat settings unchanged', () => {
      const testSettings = {
        resetToSelect: false,
        atomColoring: true,
      };

      mockLocalStorage['ketcher-opts'] = JSON.stringify(testSettings);

      const loaded = SettingsMigration.loadFromLegacyStorage();

      expect(loaded).toEqual(testSettings);
    });

    it('should load from ketcher_editor_saved_settings key', () => {
      const testSettings = {
        macromolecules: {
          selectionTool: 'lasso',
        },
      };

      mockLocalStorage.ketcher_editor_saved_settings =
        JSON.stringify(testSettings);

      const loaded = SettingsMigration.loadFromLegacyStorage();

      expect(loaded).toBeDefined();
      expect(loaded).toEqual({ selectionTool: 'lasso' });
    });

    it('should prioritize ketcher-opts over ketcher_editor_saved_settings', () => {
      mockLocalStorage['ketcher-opts'] = JSON.stringify({
        resetToSelect: false,
      });
      mockLocalStorage.ketcher_editor_saved_settings = JSON.stringify({
        selectionTool: 'lasso',
      });

      const loaded = SettingsMigration.loadFromLegacyStorage();

      // Should load from first found key (ketcher-opts)
      expect(loaded).toEqual({ resetToSelect: false });
    });

    it('should return null when no legacy keys exist', () => {
      const loaded = SettingsMigration.loadFromLegacyStorage();

      expect(loaded).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      mockLocalStorage['ketcher-opts'] = 'invalid json';

      const loaded = SettingsMigration.loadFromLegacyStorage();

      // Should continue to next key
      expect(loaded).toBeNull();
    });

    it('should handle localStorage not available', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      const loaded = SettingsMigration.loadFromLegacyStorage();

      expect(loaded).toBeNull();
    });
  });
});
