/**
 * Settings migration logic for backward compatibility
 * Handles migration from namespaced format back to flat format
 */

/* eslint-disable @typescript-eslint/no-explicit-any, dot-notation */

import type { Settings, DeepPartial } from './types';

export class SettingsMigration {
  /**
   * Migrate settings from namespaced format back to flat format
   * Handles legacy namespaced storage and ensures flat structure
   */
  static migrate(stored: any): DeepPartial<Settings> {
    if (!stored || typeof stored !== 'object') {
      return {};
    }

    // Check if already in flat format
    if (this.isFlatFormat(stored)) {
      return stored as DeepPartial<Settings>;
    }

    // Migrate from namespaced format to flat format
    return this.migrateFromNamespacedFormat(stored);
  }

  /**
   * Check if settings are in flat format
   * Flat format has top-level setting keys and no category keys
   */
  private static isFlatFormat(stored: any): boolean {
    if (!stored || typeof stored !== 'object') {
      return false;
    }

    // Sample keys from flat format
    const flatKeys = [
      'resetToSelect',
      'rotationStep',
      'atomColoring',
      'bondLength',
    ];
    const categoryKeys = [
      'editor',
      'render',
      'server',
      'debug',
      'miew',
      'macromolecules',
    ];

    const hasFlatKeys = flatKeys.some((key) => key in stored);
    const hasCategoryKeys = categoryKeys.some((key) => key in stored);

    // It's flat if it has flat keys and no category keys
    return hasFlatKeys && !hasCategoryKeys;
  }

  /**
   * Flatten namespaced structure by spreading all categories
   */
  private static migrateFromNamespacedFormat(old: any): DeepPartial<Settings> {
    const flat: any = {};

    // Spread all category objects into flat structure
    if (old.editor && typeof old.editor === 'object') {
      Object.assign(flat, old.editor);
    }
    if (old.render && typeof old.render === 'object') {
      Object.assign(flat, old.render);
    }
    if (old.server && typeof old.server === 'object') {
      Object.assign(flat, old.server);
    }
    if (old.debug && typeof old.debug === 'object') {
      Object.assign(flat, old.debug);
    }
    if (old.miew && typeof old.miew === 'object') {
      Object.assign(flat, old.miew);
    }
    if (old.macromolecules && typeof old.macromolecules === 'object') {
      Object.assign(flat, old.macromolecules);
    }

    return flat as DeepPartial<Settings>;
  }

  /**
   * Attempt to load from legacy storage keys
   * Tries both 'ketcher-opts' and 'ketcher_editor_saved_settings'
   */
  static loadFromLegacyStorage(): DeepPartial<Settings> | null {
    const keys = ['ketcher-opts', 'ketcher_editor_saved_settings'];

    for (const key of keys) {
      try {
        if (typeof localStorage === 'undefined') {
          continue;
        }

        const item = localStorage.getItem(key);
        if (item) {
          const parsed = JSON.parse(item);
          return this.migrate(parsed);
        }
      } catch (error) {
        console.warn(`Failed to load from legacy key ${key}:`, error);
      }
    }

    return null;
  }
}
