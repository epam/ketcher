/**
 * Unit tests for MemoryStorageAdapter
 */

import { MemoryStorageAdapter } from '../MemoryStorageAdapter';
import { getDefaultSettings } from '../schema';

describe('MemoryStorageAdapter', () => {
  let adapter: MemoryStorageAdapter;

  beforeEach(() => {
    adapter = new MemoryStorageAdapter();
  });

  describe('isAvailable', () => {
    it('should always return true', () => {
      expect(adapter.isAvailable()).toBe(true);
    });
  });

  describe('load', () => {
    it('should return null when key does not exist', async () => {
      const loaded = await adapter.load('non-existent-key');

      expect(loaded).toBeNull();
    });

    it('should load settings that were previously saved', async () => {
      const testSettings = getDefaultSettings();
      testSettings.editor.resetToSelect = false;

      await adapter.save('test-key', testSettings);
      const loaded = await adapter.load('test-key');

      expect(loaded).toEqual(testSettings);
    });

    it('should return independent copies (not references)', async () => {
      const testSettings = getDefaultSettings();

      await adapter.save('test-key', testSettings);
      const loaded = await adapter.load('test-key');

      expect(loaded).not.toBe(testSettings);
      expect(loaded).toEqual(testSettings);
    });
  });

  describe('save', () => {
    it('should save settings to memory', async () => {
      const testSettings = getDefaultSettings();

      await adapter.save('test-key', testSettings);
      const loaded = await adapter.load('test-key');

      expect(loaded).toEqual(testSettings);
    });

    it('should overwrite existing settings', async () => {
      const settings1 = getDefaultSettings();
      settings1.editor.resetToSelect = false;

      const settings2 = getDefaultSettings();
      settings2.editor.resetToSelect = true;

      await adapter.save('test-key', settings1);
      await adapter.save('test-key', settings2);

      const loaded = await adapter.load('test-key');

      expect(loaded?.editor.resetToSelect).toBe(true);
    });

    it('should support multiple keys', async () => {
      const settings1 = getDefaultSettings();
      settings1.editor.resetToSelect = false;

      const settings2 = getDefaultSettings();
      settings2.editor.resetToSelect = true;

      await adapter.save('key1', settings1);
      await adapter.save('key2', settings2);

      const loaded1 = await adapter.load('key1');
      const loaded2 = await adapter.load('key2');

      expect(loaded1?.editor.resetToSelect).toBe(false);
      expect(loaded2?.editor.resetToSelect).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove settings from memory', async () => {
      const testSettings = getDefaultSettings();

      await adapter.save('test-key', testSettings);
      await adapter.clear('test-key');

      const loaded = await adapter.load('test-key');

      expect(loaded).toBeNull();
    });

    it('should not affect other keys', async () => {
      const settings1 = getDefaultSettings();
      const settings2 = getDefaultSettings();

      await adapter.save('key1', settings1);
      await adapter.save('key2', settings2);

      await adapter.clear('key1');

      const loaded1 = await adapter.load('key1');
      const loaded2 = await adapter.load('key2');

      expect(loaded1).toBeNull();
      expect(loaded2).not.toBeNull();
    });
  });

  describe('clearAll', () => {
    it('should clear all stored settings', async () => {
      const settings1 = getDefaultSettings();
      const settings2 = getDefaultSettings();

      await adapter.save('key1', settings1);
      await adapter.save('key2', settings2);

      adapter.clearAll();

      const loaded1 = await adapter.load('key1');
      const loaded2 = await adapter.load('key2');

      expect(loaded1).toBeNull();
      expect(loaded2).toBeNull();
    });

    it('should allow new saves after clearAll', async () => {
      const settings = getDefaultSettings();

      await adapter.save('key1', settings);
      adapter.clearAll();
      await adapter.save('key2', settings);

      const loaded = await adapter.load('key2');

      expect(loaded).not.toBeNull();
    });
  });

  describe('data isolation', () => {
    it('should store independent copies of settings', async () => {
      const testSettings = getDefaultSettings();
      testSettings.editor.resetToSelect = false;

      await adapter.save('test-key', testSettings);

      // Modify original
      testSettings.editor.resetToSelect = true;

      // Stored version should not be affected
      const loaded = await adapter.load('test-key');
      expect(loaded?.editor.resetToSelect).toBe(false);
    });
  });
});
