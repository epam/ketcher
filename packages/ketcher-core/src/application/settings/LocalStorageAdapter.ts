/**
 * LocalStorage adapter for settings persistence
 * Wraps browser localStorage with error handling and availability checks
 */

import type { ISettingsStorage, Settings } from './types';

export class LocalStorageAdapter implements ISettingsStorage {
  /**
   * Load settings from localStorage
   * Returns null if not found or on error
   */
  async load(key: string): Promise<Partial<Settings> | null> {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) {
        return null;
      }
      return JSON.parse(item);
    } catch (error) {
      console.error(
        `Failed to load settings from localStorage (key: ${key}):`,
        error,
      );
      return null;
    }
  }

  /**
   * Save settings to localStorage
   * Throws error if localStorage is not available
   */
  async save(key: string, settings: Settings): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('localStorage is not available');
    }

    try {
      const json = JSON.stringify(settings);
      localStorage.setItem(key, json);
    } catch (error) {
      console.error(
        `Failed to save settings to localStorage (key: ${key}):`,
        error,
      );
      throw error;
    }
  }

  /**
   * Clear settings from localStorage
   */
  async clear(key: string): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(
        `Failed to clear settings from localStorage (key: ${key}):`,
        error,
      );
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
}
