/**
 * In-memory storage adapter for settings
 * Useful for testing and environments without localStorage
 */

import type { ISettingsStorage, Settings } from './types';

export class MemoryStorageAdapter implements ISettingsStorage {
  private storage: Map<string, Settings> = new Map();

  /**
   * Load settings from memory
   */
  async load(key: string): Promise<Partial<Settings> | null> {
    return this.storage.get(key) || null;
  }

  /**
   * Save settings to memory
   */
  async save(key: string, settings: Settings): Promise<void> {
    this.storage.set(key, JSON.parse(JSON.stringify(settings)));
  }

  /**
   * Clear settings from memory
   */
  async clear(key: string): Promise<void> {
    this.storage.delete(key);
  }

  /**
   * Memory storage is always available
   */
  isAvailable(): boolean {
    return true;
  }

  /**
   * Clear all stored settings (useful for tests)
   */
  clearAll(): void {
    this.storage.clear();
  }
}
