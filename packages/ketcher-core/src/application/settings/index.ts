/**
 * Settings module exports
 * Centralized settings management for Ketcher
 */

// Types and interfaces
export type {
  Settings,
  EditorSettings,
  RenderSettings,
  ServerSettings,
  DebugSettings,
  MiewSettings,
  MacromoleculesSettings,
  ValidationResult,
  ValidationError,
  SettingsListener,
  Unsubscribe,
  SettingsServiceOptions,
  ISettingsStorage,
  ISettingsValidator,
  DeepPartial,
} from './types';

export { SettingsValidationError } from './types';

export type { ISettingsService } from './ISettingsService';

// Main service
export { SettingsService } from './SettingsService';

// Storage adapters
export { LocalStorageAdapter } from './LocalStorageAdapter';
export { MemoryStorageAdapter } from './MemoryStorageAdapter';

// Validator
export { SchemaValidator } from './SchemaValidator';

// Migration
export { SettingsMigration } from './SettingsMigration';

// Schema and defaults
export { getDefaultSettings, PRESETS, SCHEMA } from './schema';
