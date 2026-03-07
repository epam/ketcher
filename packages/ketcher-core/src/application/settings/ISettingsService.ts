/**
 * Settings service interface
 * Provides centralized settings management with validation, persistence, and reactive updates
 */

import type {
  Settings,
  DeepPartial,
  ValidationResult,
  SettingsListener,
  Unsubscribe,
} from './types';

export interface ISettingsService {
  /**
   * Initialize the service (load from storage, run migrations)
   * Must be called before other methods
   */
  init(): Promise<void>;

  /**
   * Get current settings (immutable)
   */
  getSettings(): Settings;

  /**
   * Update settings (deep merge, validates, persists, emits event)
   * Returns updated settings on success
   * Throws SettingsValidationError if validation fails
   */
  updateSettings(partial: DeepPartial<Settings>): Promise<Settings>;

  /**
   * Reset to default settings
   */
  resetToDefaults(): Promise<Settings>;

  /**
   * Load a preset (e.g., 'acs')
   */
  loadPreset(name: string): Promise<Settings>;

  /**
   * Get available preset names
   */
  getAvailablePresets(): string[];

  /**
   * Validate settings without applying
   */
  validateSettings(settings: Partial<Settings>): ValidationResult;

  /**
   * Export settings as JSON string
   */
  exportSettings(): string;

  /**
   * Import settings from JSON string
   * Validates and applies the imported settings
   */
  importSettings(json: string): Promise<Settings>;

  /**
   * Subscribe to settings changes
   * Returns unsubscribe function
   */
  subscribe(listener: SettingsListener): Unsubscribe;
}
