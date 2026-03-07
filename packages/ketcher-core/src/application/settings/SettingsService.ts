/**
 * Settings service implementation
 * Centralized settings management with validation, persistence, and reactive updates
 */

import { EventEmitter } from 'events';
import type { ISettingsService } from './ISettingsService';
import {
  SettingsValidationError,
  type Settings,
  type DeepPartial,
  type ValidationResult,
  type SettingsListener,
  type Unsubscribe,
  type SettingsServiceOptions,
  type ISettingsStorage,
  type ISettingsValidator,
} from './types';
import { getDefaultSettings, PRESETS } from './schema';
import { LocalStorageAdapter } from './LocalStorageAdapter';
import { SchemaValidator } from './SchemaValidator';
import { SettingsMigration } from './SettingsMigration';

/**
 * Default storage key for localStorage
 */
const DEFAULT_STORAGE_KEY = 'ketcher-opts';

/**
 * SettingsService implementation
 * Provides centralized, validated, and persistent settings management
 */
export class SettingsService implements ISettingsService {
  private settings: Settings;
  private storage: ISettingsStorage;
  private validator: ISettingsValidator;
  private emitter: EventEmitter;
  private storageKey: string;
  private autoSave: boolean;
  private initialized = false;

  constructor(options: SettingsServiceOptions = {}) {
    this.storage = options.storage || new LocalStorageAdapter();
    this.validator = options.validator || new SchemaValidator();
    this.storageKey = options.storageKey || DEFAULT_STORAGE_KEY;
    this.autoSave = options.autoSave ?? true;
    this.emitter = new EventEmitter();

    // Initialize with defaults (will be overwritten by init())
    this.settings = this.mergeWithDefaults(options.defaults || {});
  }

  /**
   * Initialize the service
   * Loads from storage, runs migrations, validates, and persists
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // 1. Try to load from storage
      const stored = await this.storage.load(this.storageKey);

      if (stored) {
        // 2. Run migration if needed
        const migrated = SettingsMigration.migrate(stored);

        // 3. Merge with defaults
        const merged = this.mergeWithDefaults(migrated);

        // 4. Validate merged settings
        const validation = this.validator.validate(merged);
        if (!validation.valid) {
          console.warn(
            'Invalid settings in storage, using defaults',
            validation.errors,
          );
          // Keep settings from constructor (includes custom defaults if provided)
        } else {
          this.settings = merged;
        }
      } else {
        // No stored settings, keep the defaults from constructor
        // (which already includes custom defaults if provided)
        // this.settings is already set from constructor
      }

      // 5. Persist initial state
      if (this.autoSave) {
        await this.storage.save(this.storageKey, this.settings);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize settings:', error);
      // Keep settings from constructor (includes custom defaults if provided)
      this.initialized = true;
    }
  }

  /**
   * Get current settings (immutable)
   */
  getSettings(): Settings {
    this.assertInitialized();
    return this.freeze(this.settings);
  }

  /**
   * Update settings (deep merge, validates, persists, emits event)
   * Returns updated settings on success
   * Throws SettingsValidationError if validation fails
   */
  async updateSettings(partial: DeepPartial<Settings>): Promise<Settings> {
    this.assertInitialized();

    // 1. Validate partial
    const validation = this.validator.validatePartial(partial);
    if (!validation.valid) {
      const error = new Error(
        `Settings validation failed: ${validation.errors
          ?.map((e) => e.message)
          .join(', ')}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as SettingsValidationError & { errors: any[] };
      error.name = 'SettingsValidationError';
      error.errors = validation.errors || [];
      throw error;
    }

    // 2. Deep merge
    const updated = this.deepMerge(this.settings, partial);

    // 3. Validate complete settings
    const fullValidation = this.validator.validate(updated);
    if (!fullValidation.valid) {
      const error = new Error(
        `Settings validation failed: ${fullValidation.errors
          ?.map((e) => e.message)
          .join(', ')}`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ) as SettingsValidationError & { errors: any[] };
      error.name = 'SettingsValidationError';
      error.errors = fullValidation.errors || [];
      throw error;
    }

    // 4. Update internal state
    this.settings = updated;

    // 5. Persist
    if (this.autoSave) {
      try {
        await this.storage.save(this.storageKey, this.settings);
      } catch (error) {
        console.error('Failed to persist settings:', error);
      }
    }

    // 6. Emit event
    this.emitter.emit('settings:changed', this.freeze(this.settings));

    return this.getSettings();
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults(): Promise<Settings> {
    this.assertInitialized();
    const defaults = getDefaultSettings();
    return this.updateSettings(defaults);
  }

  /**
   * Load a preset
   */
  async loadPreset(name: string): Promise<Settings> {
    this.assertInitialized();

    const preset = PRESETS[name];
    if (!preset) {
      throw new Error(`Unknown preset: ${name}`);
    }

    return this.updateSettings(preset);
  }

  /**
   * Get available preset names
   */
  getAvailablePresets(): string[] {
    return Object.keys(PRESETS);
  }

  /**
   * Validate settings without applying
   */
  validateSettings(settings: Partial<Settings>): ValidationResult {
    return this.validator.validate(settings);
  }

  /**
   * Export settings as JSON string
   */
  exportSettings(): string {
    this.assertInitialized();
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON string
   */
  async importSettings(json: string): Promise<Settings> {
    this.assertInitialized();

    try {
      const parsed = JSON.parse(json);
      return this.updateSettings(parsed);
    } catch (error) {
      throw new Error(`Failed to import settings: ${(error as Error).message}`);
    }
  }

  /**
   * Subscribe to settings changes
   * Returns unsubscribe function
   */
  subscribe(listener: SettingsListener): Unsubscribe {
    this.emitter.on('settings:changed', listener);
    return () => {
      this.emitter.off('settings:changed', listener);
    };
  }

  /**
   * Get the settings schema (for UI generation, documentation)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSchema(): any {
    return PRESETS;
  }

  /**
   * Deep merge two objects
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private deepMerge(target: any, source: any): any {
    if (!source || typeof source !== 'object') {
      return target;
    }

    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (
          sourceValue &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          // Recursively merge objects
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else {
          // Replace value
          result[key] = sourceValue;
        }
      }
    }

    return result;
  }

  /**
   * Merge partial settings with defaults
   */
  private mergeWithDefaults(partial: DeepPartial<Settings>): Settings {
    const defaults = getDefaultSettings();
    return this.deepMerge(defaults, partial) as Settings;
  }

  /**
   * Deep freeze object to make it immutable
   */
  private freeze<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Assert that service is initialized
   */
  private assertInitialized(): void {
    if (!this.initialized) {
      throw new Error('SettingsService not initialized. Call init() first.');
    }
  }
}
