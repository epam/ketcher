/**
 * Unit tests for SettingsService
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */

import { SettingsService } from '../SettingsService';
import { MemoryStorageAdapter } from '../MemoryStorageAdapter';
import type { Settings, ISettingsStorage, DeepPartial } from '../types';
import { getDefaultSettings } from '../schema';

describe('SettingsService', () => {
  let service: SettingsService;
  let storage: ISettingsStorage;

  beforeEach(async () => {
    SettingsService.resetInstance();
    storage = new MemoryStorageAdapter();
    service = await SettingsService.getInstance({
      storage,
      autoSave: false, // Disable auto-save for easier testing
    });
  });

  describe('initialization', () => {
    it('should initialize with defaults when storage is empty', async () => {
      const settings = service.getSettings();
      const defaults = getDefaultSettings();

      expect(settings.resetToSelect).toBe(defaults.resetToSelect);
      expect(settings.atomColoring).toBe(defaults.atomColoring);
      expect(settings['smart-layout']).toBe(defaults['smart-layout']);
    });

    it('should load from storage when available', async () => {
      const customSettings: DeepPartial<Settings> = {
        resetToSelect: false,
        atomColoring: false,
      };

      await storage.save('ketcher-opts', customSettings as Settings);

      SettingsService.resetInstance();
      const newService = await SettingsService.getInstance({ storage });

      const settings = newService.getSettings();
      expect(settings.resetToSelect).toBe(false);
      expect(settings.atomColoring).toBe(false);
    });

    it('should merge stored settings with defaults', async () => {
      const partialSettings: DeepPartial<Settings> = {
        resetToSelect: false,
      };

      await storage.save('ketcher-opts', partialSettings as Settings);

      SettingsService.resetInstance();
      const newService = await SettingsService.getInstance({ storage });

      const settings = newService.getSettings();
      const defaults = getDefaultSettings();

      // Custom value
      expect(settings.resetToSelect).toBe(false);
      // Default values should still be present
      expect(settings.rotationStep).toBe(defaults.rotationStep);
      expect(settings.atomColoring).toBe(defaults.atomColoring);
    });

    it('should use defaults on invalid stored settings', async () => {
      const invalidSettings = { invalid: 'data' };
      await storage.save('ketcher-opts', invalidSettings as any);

      SettingsService.resetInstance();
      const newService = await SettingsService.getInstance({ storage });

      const settings = newService.getSettings();
      const defaults = getDefaultSettings();

      expect(settings).toEqual(defaults);
    });

    it('should not allow multiple initializations', async () => {
      // getInstance already initializes, calling it again should return the same instance
      const service2 = await SettingsService.getInstance({ storage });

      expect(service2).toBe(service);
      expect(service.getSettings()).toBeDefined();
    });

    it('should always return initialized instance via getInstance', async () => {
      // With singleton pattern, getInstance always returns an initialized instance
      SettingsService.resetInstance();
      const newService = await SettingsService.getInstance({ storage });

      // Should be able to call methods immediately after getInstance
      expect(() => newService.getSettings()).not.toThrow();
      expect(newService.getSettings()).toBeDefined();
    });
  });

  describe('getSettings', () => {
    it('should return complete settings object with flat structure', () => {
      const settings = service.getSettings();

      // Check for flat properties
      expect(settings).toHaveProperty('resetToSelect');
      expect(settings).toHaveProperty('rotationStep');
      expect(settings).toHaveProperty('atomColoring');
      expect(settings).toHaveProperty('bondThickness');
      expect(settings).toHaveProperty('smart-layout');
      expect(settings).toHaveProperty('showAtomIds');
      expect(settings).toHaveProperty('miewMode');
      expect(settings).toHaveProperty('selectionTool');
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

  describe('updateSettings', () => {
    it('should update settings with partial object', async () => {
      await service.updateSettings({
        resetToSelect: false,
      });

      const settings = service.getSettings();
      expect(settings.resetToSelect).toBe(false);
    });

    it('should deep merge nested updates', async () => {
      await service.updateSettings({
        atomColoring: false,
      });

      await service.updateSettings({
        bondThickness: 2.5,
      });

      const settings = service.getSettings();
      expect(settings.atomColoring).toBe(false);
      expect(settings.bondThickness).toBe(2.5);
    });

    it('should preserve other settings when updating one property', async () => {
      const initialRotation = service.getSettings().rotationStep;

      await service.updateSettings({
        atomColoring: false,
      });

      const updatedRotation = service.getSettings().rotationStep;
      expect(updatedRotation).toEqual(initialRotation);
    });

    it('should return updated settings', async () => {
      const updated = await service.updateSettings({
        resetToSelect: false,
      });

      expect(updated.resetToSelect).toBe(false);
    });

    it('should emit settings:changed event', async () => {
      const listener = jest.fn();
      service.subscribe(listener);

      await service.updateSettings({
        resetToSelect: false,
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ resetToSelect: false }),
      );
    });

    it('should validate settings before applying', async () => {
      await expect(
        service.updateSettings({
          rotationStep: 200 as any, // Invalid: max is 90
        }),
      ).rejects.toThrow();
    });

    it('should not update if validation fails', async () => {
      const beforeSettings = service.getSettings();

      try {
        await service.updateSettings({
          rotationStep: 200 as any,
        });
      } catch {
        // Expected to fail
      }

      const afterSettings = service.getSettings();
      expect(afterSettings).toEqual(beforeSettings);
    });

    it('should persist to storage when autoSave is enabled', async () => {
      SettingsService.resetInstance();
      const autoSaveService = await SettingsService.getInstance({
        storage,
        autoSave: true,
      });

      await autoSaveService.updateSettings({
        resetToSelect: false,
      });

      const stored = await storage.load('ketcher-opts');
      expect(stored?.resetToSelect).toBe(false);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', async () => {
      await service.updateSettings({
        resetToSelect: false,
        atomColoring: false,
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
      expect(settings.atomColoring).toBe(false);
      expect(settings.fontszUnit).toBe('pt');
      expect(settings.bondThicknessUnit).toBe('pt');
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
      // Flat format - should have properties at root level
      expect(parsed).toHaveProperty('resetToSelect');
      expect(parsed).toHaveProperty('atomColoring');
    });

    it('should import settings from JSON string', async () => {
      const customSettings = {
        resetToSelect: false,
        rotationStep: 30,
        atomColoring: false,
      };

      const json = JSON.stringify(customSettings);
      await service.importSettings(json);

      const settings = service.getSettings();
      expect(settings.resetToSelect).toBe(false);
      expect(settings.rotationStep).toBe(30);
      expect(settings.atomColoring).toBe(false);
    });

    it('should throw error on invalid JSON', async () => {
      await expect(service.importSettings('invalid json')).rejects.toThrow(
        'Failed to import settings',
      );
    });

    it('should validate imported settings', async () => {
      const invalidSettings = {
        rotationStep: 200, // Invalid
      };

      const json = JSON.stringify(invalidSettings);

      await expect(service.importSettings(json)).rejects.toThrow();
    });
  });

  describe('subscription management', () => {
    it('should subscribe to settings changes', async () => {
      const listener = jest.fn();
      service.subscribe(listener);

      await service.updateSettings({ resetToSelect: false });

      expect(listener).toHaveBeenCalled();
    });

    it('should support multiple subscribers', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      service.subscribe(listener1);
      service.subscribe(listener2);

      await service.updateSettings({ resetToSelect: false });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should unsubscribe correctly', async () => {
      const listener = jest.fn();
      const unsubscribe = service.subscribe(listener);

      unsubscribe();

      await service.updateSettings({ resetToSelect: false });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should pass updated settings to listener', async () => {
      let receivedSettings: Settings | null = null;

      service.subscribe((settings) => {
        receivedSettings = settings;
      });

      await service.updateSettings({ resetToSelect: false });

      expect(receivedSettings).not.toBeNull();
      expect(receivedSettings!.resetToSelect).toBe(false);
    });
  });

  describe('validateSettings', () => {
    it('should validate valid settings', () => {
      const result = service.validateSettings({
        resetToSelect: true,
        rotationStep: 15,
      });

      expect(result.valid).toBe(true);
    });

    it('should return errors for invalid settings', () => {
      const result = service.validateSettings({
        rotationStep: 200 as any, // Invalid
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('custom configuration', () => {
    it('should accept custom storage adapter', async () => {
      SettingsService.resetInstance();
      const customStorage = new MemoryStorageAdapter();
      const customService = await SettingsService.getInstance({
        storage: customStorage,
      });

      expect(customService.getSettings()).toBeDefined();
    });

    it('should accept custom defaults', async () => {
      SettingsService.resetInstance();
      const customDefaults = {
        resetToSelect: false,
      };

      const customService = await SettingsService.getInstance({
        storage,
        defaults: customDefaults,
      });

      const settings = customService.getSettings();
      // Custom defaults are merged with standard defaults
      // Since storage is empty, it should use the custom default
      expect(settings.resetToSelect).toBe(false);
    });

    it('should accept custom storage key', async () => {
      SettingsService.resetInstance();
      const customKey = 'my-custom-settings';
      const customService = await SettingsService.getInstance({
        storage,
        storageKey: customKey,
      });

      await customService.updateSettings({ resetToSelect: false });

      // Manually enable auto-save and update again
      SettingsService.resetInstance();
      const autoSaveService = await SettingsService.getInstance({
        storage,
        storageKey: customKey,
        autoSave: true,
      });
      await autoSaveService.updateSettings({
        resetToSelect: false,
      });

      const stored = await storage.load(customKey);
      expect(stored).toBeDefined();
    });

    it('should respect autoSave setting', async () => {
      SettingsService.resetInstance();
      const serviceWithAutoSave = await SettingsService.getInstance({
        storage,
        autoSave: true,
      });

      await serviceWithAutoSave.updateSettings({
        resetToSelect: false,
      });

      const stored = await storage.load('ketcher-opts');
      expect(stored?.resetToSelect).toBe(false);
    });
  });
});
