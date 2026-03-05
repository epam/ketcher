/**
 * Settings migration logic for backward compatibility
 * Handles migration from old flat format to new namespaced format
 */

import type { Settings, DeepPartial } from './types';

export class SettingsMigration {
  /**
   * Migrate settings from old format to new format
   * Handles flat Redux format and legacy storage keys
   */
  static migrate(stored: any): DeepPartial<Settings> {
    if (!stored || typeof stored !== 'object') {
      return {};
    }

    // Check if already in new namespaced format
    if (this.isNewFormat(stored)) {
      return stored as DeepPartial<Settings>;
    }

    // Migrate from flat Redux format to namespaced format
    return this.migrateFromFlatFormat(stored);
  }

  /**
   * Check if settings are in new namespaced format
   */
  private static isNewFormat(stored: any): boolean {
    return (
      stored &&
      typeof stored === 'object' &&
      ('editor' in stored ||
        'render' in stored ||
        'server' in stored ||
        'debug' in stored ||
        'miew' in stored ||
        'macromolecules' in stored)
    );
  }

  /**
   * Migrate from flat Redux format to namespaced structure
   */
  private static migrateFromFlatFormat(old: any): DeepPartial<Settings> {
    const migrated: any = {};

    // Editor settings keys
    const editorKeys = ['resetToSelect', 'rotationStep'];

    // Render settings keys
    const renderKeys = [
      'showValenceWarnings',
      'atomColoring',
      'font',
      'fontsz',
      'fontszUnit',
      'fontszsub',
      'showStereoFlags',
      'stereoLabelStyle',
      'colorOfAbsoluteCenters',
      'colorOfAndCenters',
      'colorOfOrCenters',
      'colorStereogenicCenters',
      'autoFadeOfStereoLabels',
      'absFlagLabel',
      'andFlagLabel',
      'orFlagLabel',
      'mixedFlagLabel',
      'ignoreChiralFlag',
      'carbonExplicitly',
      'showCharge',
      'showValence',
      'showHydrogenLabels',
      'aromaticCircle',
      'bondSpacing',
      'bondLength',
      'bondLengthUnit',
      'bondThickness',
      'bondThicknessUnit',
      'stereoBondWidth',
      'stereoBondWidthUnit',
      'hashSpacing',
      'hashSpacingUnit',
      'imageResolution',
      'reactionComponentMarginSize',
    ];

    // Server settings keys
    const serverKeys = [
      'smart-layout',
      'ignore-stereochemistry-errors',
      'mass-skip-error-on-pseudoatoms',
      'gross-formula-add-rsites',
      'aromatize-skip-superatoms',
      'dearomatize-on-load',
      'gross-formula-add-isotopes',
    ];

    // Debug settings keys
    const debugKeys = [
      'showAtomIds',
      'showBondIds',
      'showHalfBondIds',
      'showLoopIds',
    ];

    // Miew settings keys
    const miewKeys = ['miewMode', 'miewTheme', 'miewAtomLabel'];

    // Macromolecules settings keys
    const macromoleculesKeys = [
      'selectionTool',
      'editorLineLength',
      'disableCustomQuery',
      'monomerLibraryUpdates',
    ];

    // Extract and migrate settings by category
    if (this.hasAnyKey(old, editorKeys)) {
      migrated.editor = this.extractKeys(old, editorKeys);
    }

    if (this.hasAnyKey(old, renderKeys)) {
      migrated.render = this.extractKeys(old, renderKeys);
    }

    if (this.hasAnyKey(old, serverKeys)) {
      migrated.server = this.extractKeys(old, serverKeys);
    }

    if (this.hasAnyKey(old, debugKeys)) {
      migrated.debug = this.extractKeys(old, debugKeys);
    }

    if (this.hasAnyKey(old, miewKeys)) {
      migrated.miew = this.extractKeys(old, miewKeys);
    }

    if (this.hasAnyKey(old, macromoleculesKeys)) {
      migrated.macromolecules = this.extractKeys(old, macromoleculesKeys);
    }

    return migrated as DeepPartial<Settings>;
  }

  /**
   * Check if object has any of the specified keys
   */
  private static hasAnyKey(obj: any, keys: string[]): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }
    return keys.some((key) => key in obj);
  }

  /**
   * Extract specified keys from object
   */
  private static extractKeys(obj: any, keys: string[]): any {
    const extracted: any = {};
    keys.forEach((key) => {
      if (key in obj) {
        extracted[key] = obj[key];
      }
    });
    return extracted;
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
