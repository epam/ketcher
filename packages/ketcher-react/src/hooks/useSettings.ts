/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { useEffect, useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../script/ui/state/hooks';
import { syncSettingsFromCore } from '../script/ui/state/options';
import type { Settings, DeepPartial, ISettingsService } from 'ketcher-core';

/**
 * React hook to access settings from ketcher-core settings service
 * Provides reactive access to settings with update methods
 *
 * @example
 * ```typescript
 * const { settings, updateSettings, loadPreset } = useSettings();
 *
 * // Read settings
 * console.log(settings?.resetToSelect);
 *
 * // Update settings
 * await updateSettings({ atomColoring: false });
 *
 * // Load preset
 * await loadPreset('acs');
 * ```
 */
export function useSettings() {
  // Get ketcher instance from Redux store
  // The editor is set in the store during initialization
  const editor = useAppSelector((state) => state.editor);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ketcherInstance = editor ? (editor as any).ketcher : null;
  const settingsService: ISettingsService | undefined =
    ketcherInstance?.settingsService;
  const dispatch = useAppDispatch();

  // Local state for settings (synced from service)
  const [settings, setSettings] = useState<Settings | null>(
    settingsService?.getSettings() || null,
  );

  // Subscribe to settings changes from core
  useEffect(() => {
    if (!settingsService) {
      return;
    }

    // Subscribe to settings changes
    const unsubscribe = settingsService.subscribe((newSettings) => {
      // 1. Update local state
      setSettings(newSettings);

      // 2. Sync to Redux for backward compatibility
      dispatch(syncSettingsFromCore(newSettings));
    });

    // Initialize with current settings
    const current = settingsService.getSettings();
    setSettings(current);
    dispatch(syncSettingsFromCore(current));

    return unsubscribe;
  }, [settingsService, dispatch]);

  // Update settings (deep merge)
  const updateSettings = useCallback(
    async (partial: DeepPartial<Settings>) => {
      if (!settingsService) {
        throw new Error('Settings service not available');
      }
      return settingsService.updateSettings(partial);
    },
    [settingsService],
  );

  // Reset to default settings
  const resetToDefaults = useCallback(async () => {
    if (!settingsService) {
      throw new Error('Settings service not available');
    }
    return settingsService.resetToDefaults();
  }, [settingsService]);

  // Load a preset (e.g., 'acs')
  const loadPreset = useCallback(
    async (name: string) => {
      if (!settingsService) {
        throw new Error('Settings service not available');
      }
      return settingsService.loadPreset(name);
    },
    [settingsService],
  );

  // Export settings as JSON string
  const exportSettings = useCallback(() => {
    if (!settingsService) {
      throw new Error('Settings service not available');
    }
    return settingsService.exportSettings();
  }, [settingsService]);

  // Import settings from JSON string
  const importSettings = useCallback(
    async (json: string) => {
      if (!settingsService) {
        throw new Error('Settings service not available');
      }
      return settingsService.importSettings(json);
    },
    [settingsService],
  );

  // Get available preset names
  const availablePresets = settingsService?.getAvailablePresets() || [];

  return {
    // Flat settings
    settings,

    // Update methods
    updateSettings,
    resetToDefaults,
    loadPreset,
    exportSettings,
    importSettings,

    // Metadata
    availablePresets,

    // Service availability
    isAvailable: !!settingsService,
  };
}
