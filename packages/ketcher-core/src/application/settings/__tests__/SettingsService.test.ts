/**
 * Unit tests for SettingsService
 */

import { SettingsService } from '../SettingsService';
import { MemoryStorageAdapter } from '../MemoryStorageAdapter';
import type { Settings, ISettingsStorage, DeepPartial } from '../types';
import { getDefaultSettings } from '../schema';

describe('SettingsService', () => {
  let service: SettingsService;
  let storage: ISettingsStorage;

  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    service = new SettingsService({
      storage,
      autoSave: false, // Disable auto-save for easier testing
    });
    await service.init();
  });

  describe('initialization', () => {
    it('should initialize with defaults when storage is empty', async () => {
      const settings = service.getSettings();
      const defaults = getDefaultSettings();

      expect(settings.editor.resetToSelect).toBe(defaults.editor.resetToSelect);
      expect(settings.render.atomColoring).toBe(defaults.render.atomColoring);
      expect(settings.server['smart-layout']).toBe(
        defaults.server['smart-layout'],
      );
    });

    it('should load from storage when available', async () => {
      const customSettings: DeepPartial<Settings> = {
        editor: { resetToSelect: false },
        render: { atomColoring: false },
      };

      await storage.save('ketcher-opts', customSettings as Settings);

      const newService = new SettingsService({ storage });
      await newService.init();

      const settings = newService.getSettings();
      expect(settings.editor.resetToSelect).toBe(false);
      expect(settings.render.atomColoring).toBe(false);
    });

    it('should merge stored settings with defaults', async () => {
      const partialSettings: DeepPartial<Settings> = {
        editor: { resetToSelect: false },
      };

      await storage.save('ketcher-opts', partialSettings as Settings);

      const newService = new SettingsService({ storage });
      await newService.init();

      const settings = newService.getSettings();
      const defaults = getDefaultSettings();

      // Custom value
      expect(settings.editor.resetToSelect).toBe(false);
      // Default values should still be present
      expect(settings.editor.rotationStep).toBe(defaults.editor.rotationStep);
      expect(settings.render.atomColoring).toBe(defaults.render.atomColoring);
    });

    it('should use defaults on invalid stored settings', async () => {
      const invalidSettings = { invalid: 'data' };
      await storage.save('ketcher-opts', invalidSettings as any);

      const newService = new SettingsService({ storage });
      await newService.init();

      const settings = newService.getSettings();
      const defaults = getDefaultSettings();

      expect(settings).toEqual(defaults);
    });

    it('should not allow multiple initializations', async () => {
      await service.init();
      await service.init(); // Should not throw or re-initialize

      expect(service.getSettings()).toBeDefined();
    });

    it('should throw error if methods called before init', () => {
      const uninitializedService = new SettingsService({ storage });

      expect(() => uninitializedService.getSettings()).toThrow(
        'SettingsService not initialized',
      );
    });
  });

  describe('getSettings', () => {
    it('should return complete settings object', () => {
      const settings = service.getSettings();

      expect(settings).toHaveProperty('editor');
      expect(settings).toHaveProperty('render');
      expect(settings).toHaveProperty('server');
      expect(settings).toHaveProperty('debug');
      expect(settings).toHaveProperty('miew');
      expect(settings).toHaveProperty('macromolecules');
    });

    it('should return immutable settings (frozen copy)', () => {
      const settings = service.getSettings();
      const settingsAgain = service.getSettings();

      // Different object instances
      expect(settings).not.toBe(settingsAgain);

      // But same values
      expect(settings).toEqual(settingsAgain);
    });
  });

  describe('category getters', () => {
    it('should get editor settings', () => {
      const editorSettings = service.getEditorSettings();

      expect(editorSettings).toHaveProperty('resetToSelect');
      expect(editorSettings).toHaveProperty('rotationStep');
    });

    it('should get render settings', () => {
      const renderSettings = service.getRenderSettings();

      expect(renderSettings).toHaveProperty('atomColoring');
      expect(renderSettings).toHaveProperty('bondThickness');
      expect(renderSettings).toHaveProperty('font');
    });

    it('should get server settings', () => {
      const serverSettings = service.getServerSettings();

      expect(serverSettings).toHaveProperty('smart-layout');
      expect(serverSettings).toHaveProperty('dearomatize-on-load');
    });

    it('should get debug settings', () => {
      const debugSettings = service.getDebugSettings();

      expect(debugSettings).toHaveProperty('showAtomIds');
      expect(debugSettings).toHaveProperty('showBondIds');
    });

    it('should get miew settings', () => {
      const miewSettings = service.getMiewSettings();

      expect(miewSettings).toHaveProperty('miewMode');
      expect(miewSettings).toHaveProperty('miewTheme');
    });

    it('should get macromolecules settings', () => {
      const macroSettings = service.getMacromoleculesSettings();

      expect(macroSettings).toHaveProperty('selectionTool');
      expect(macroSettings).toHaveProperty('editorLineLength');
    });
  });

  describe('updateSettings', () => {
    it('should update settings with partial object', async () => {
      await service.updateSettings({
        editor: { resetToSelect: false },
      });

      const settings = service.getSettings();
      expect(settings.editor.resetToSelect).toBe(false);
    });

    it('should deep merge nested updates', async () => {
      await service.updateSettings({
        render: { atomColoring: false },
      });

      await service.updateSettings({
        render: { bondThickness: 2.5 },
      });

      const settings = service.getSettings();
      expect(settings.render.atomColoring).toBe(false);
      expect(settings.render.bondThickness).toBe(2.5);
    });

    it('should preserve other settings when updating one category', async () => {
      const initialEditor = service.getEditorSettings();

      await service.updateSettings({
        render: { atomColoring: false },
      });

      const updatedEditor = service.getEditorSettings();
      expect(updatedEditor).toEqual(initialEditor);
    });

    it('should return updated settings', async () => {
      const updated = await service.updateSettings({
        editor: { resetToSelect: false },
      });

      expect(updated.editor.resetToSelect).toBe(false);
    });

    it('should emit settings:changed event', async () => {
      const listener = jest.fn();
      service.subscribe(listener);

      await service.updateSettings({
        editor: { resetToSelect: false },
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          editor: expect.objectContaining({ resetToSelect: false }),
        }),
      );
    });

    it('should validate settings before applying', async () => {
      await expect(
        service.updateSettings({
          editor: { rotationStep: 200 } as any, // Invalid: max is 90
        }),
      ).rejects.toThrow();
    });

    it('should not update if validation fails', async () => {
      const beforeSettings = service.getSettings();

      try {
        await service.updateSettings({
          editor: { rotationStep: 200 } as any,
        });
      } catch {
        // Expected to fail
      }

      const afterSettings = service.getSettings();
      expect(afterSettings).toEqual(beforeSettings);
    });

    it('should persist to storage when autoSave is enabled', async () => {
      const autoSaveService = new SettingsService({
        storage,
        autoSave: true,
      });
      await autoSaveService.init();

      await autoSaveService.updateSettings({
        editor: { resetToSelect: false },
      });

      const stored = await storage.load('ketcher-opts');
      expect(stored?.editor?.resetToSelect).toBe(false);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', async () => {
      await service.updateSettings({
        editor: { resetToSelect: false },
        render: { atomColoring: false },
      });

      await service.resetToDefaults();

      const settings = service.getSettings();
      const defaults = getDefaultSettings();

      expect(settings).toEqual(defaults);
    });

    it('should emit settings:changed event', async () => {
      const listener = jest.fn();
      service.subscribe(listener);

      await service.resetToDefaults();

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('presets', () => {
    it('should load ACS preset', async () => {
      await service.loadPreset('acs');

      const settings = service.getSettings();
      expect(settings.render.atomColoring).toBe(false);
      expect(settings.render.fontszUnit).toBe('pt');
      expect(settings.render.bondThicknessUnit).toBe('pt');
    });

    it('should throw error for unknown preset', async () => {
      await expect(service.loadPreset('unknown')).rejects.toThrow(
        'Unknown preset',
      );
    });

    it('should get available preset names', () => {
      const presets = service.getAvailablePresets();

      expect(Array.isArray(presets)).toBe(true);
      expect(presets).toContain('acs');
    });

    it('should emit settings:changed event when loading preset', async () => {
      const listener = jest.fn();
      service.subscribe(listener);

      await service.loadPreset('acs');

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('import/export', () => {
    it('should export settings as JSON string', () => {
      const json = service.exportSettings();

      expect(typeof json).toBe('string');
      expect(() => JSON.parse(json)).not.toThrow();

      const parsed = JSON.parse(json);
      expect(parsed).toHaveProperty('editor');
      expect(parsed).toHaveProperty('render');
    });

    it('should import settings from JSON string', async () => {
      const customSettings = {
        editor: { resetToSelect: false, rotationStep: 30 },
        render: { atomColoring: false },
      };

      const json = JSON.stringify(customSettings);
      await service.importSettings(json);

      const settings = service.getSettings();
      expect(settings.editor.resetToSelect).toBe(false);
      expect(settings.editor.rotationStep).toBe(30);
      expect(settings.render.atomColoring).toBe(false);
    });

    it('should throw error on invalid JSON', async () => {
      await expect(service.importSettings('invalid json')).rejects.toThrow(
        'Failed to import settings',
      );
    });

    it('should validate imported settings', async () => {
      const invalidSettings = {
        editor: { rotationStep: 200 }, // Invalid
      };

      const json = JSON.stringify(invalidSettings);

      await expect(service.importSettings(json)).rejects.toThrow();
    });
  });

  describe('subscription management', () => {
    it('should subscribe to settings changes', async () => {
      const listener = jest.fn();
      service.subscribe(listener);

      await service.updateSettings({ editor: { resetToSelect: false } });

      expect(listener).toHaveBeenCalled();
    });

    it('should support multiple subscribers', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      service.subscribe(listener1);
      service.subscribe(listener2);

      await service.updateSettings({ editor: { resetToSelect: false } });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should unsubscribe correctly', async () => {
      const listener = jest.fn();
      const unsubscribe = service.subscribe(listener);

      unsubscribe();

      await service.updateSettings({ editor: { resetToSelect: false } });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should pass updated settings to listener', async () => {
      let receivedSettings: Settings | null = null;

      service.subscribe((settings) => {
        receivedSettings = settings;
      });

      await service.updateSettings({ editor: { resetToSelect: false } });

      expect(receivedSettings).not.toBeNull();
      expect(receivedSettings?.editor.resetToSelect).toBe(false);
    });
  });

  describe('validateSettings', () => {
    it('should validate valid settings', () => {
      const result = service.validateSettings({
        editor: { resetToSelect: true, rotationStep: 15 },
      });

      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid settings', () => {
      const result = service.validateSettings({
        editor: { rotationStep: 200 } as any, // Invalid
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('custom configuration', () => {
    it('should accept custom storage adapter', async () => {
      const customStorage = new MemoryStorageAdapter();
      const customService = new SettingsService({ storage: customStorage });

      await customService.init();

      expect(customService.getSettings()).toBeDefined();
    });

    it('should accept custom defaults', async () => {
      const customDefaults = {
        editor: { resetToSelect: false },
      };

      const customService = new SettingsService({
        storage,
        defaults: customDefaults,
      });

      await customService.init();

      const settings = customService.getSettings();
      // Custom defaults are merged with standard defaults
      // Since storage is empty, it should use the custom default
      expect(settings.editor.resetToSelect).toBe(false);
    });

    it('should accept custom storage key', async () => {
      const customKey = 'my-custom-settings';
      const customService = new SettingsService({
        storage,
        storageKey: customKey,
      });

      await customService.init();
      await customService.updateSettings({ editor: { resetToSelect: false } });

      // Manually enable auto-save and update again
      const autoSaveService = new SettingsService({
        storage,
        storageKey: customKey,
        autoSave: true,
      });
      await autoSaveService.init();
      await autoSaveService.updateSettings({
        editor: { resetToSelect: false },
      });

      const stored = await storage.load(customKey);
      expect(stored).toBeDefined();
    });

    it('should respect autoSave setting', async () => {
      const serviceWithAutoSave = new SettingsService({
        storage,
        autoSave: true,
      });
      await serviceWithAutoSave.init();

      await serviceWithAutoSave.updateSettings({
        editor: { resetToSelect: false },
      });

      const stored = await storage.load('ketcher-opts');
      expect(stored?.editor?.resetToSelect).toBe(false);
    });
  });
});
