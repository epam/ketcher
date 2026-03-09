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
import { useAppDispatch } from '../script/ui/state/hooks';
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
  const dispatch = useAppDispatch();

  // Local state for settings (synced from service)
  const [settings, setSettings] = useState<Settings | null>(null);

  // Subscribe to settings changes from core
  useEffect(() => {
    // Check for ketcher instance with retry mechanism
    const checkAndSubscribe = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ketcherInstance = (window as any).ketcher;
      const settingsService: ISettingsService | undefined =
        ketcherInstance?.settingsService;

      if (!settingsService) {
        return null;
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
    };

    // Try immediately
    let unsubscribe = checkAndSubscribe();

    // If not available, poll every 100ms for up to 5 seconds
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    const intervalId = !unsubscribe
      ? setInterval(() => {
          attempts++;
          unsubscribe = checkAndSubscribe();

          if (unsubscribe || attempts >= maxAttempts) {
            clearInterval(intervalId);
          }
        }, 100)
      : null;

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (unsubscribe) unsubscribe();
    };
  }, [dispatch]);

  // Helper to get settings service
  const getSettingsService = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ketcherInstance = (window as any).ketcher;
    const service: ISettingsService | undefined =
      ketcherInstance?.settingsService;
    if (!service) {
      throw new Error('Settings service not available');
    }
    return service;
  }, []);

  // Update settings (deep merge)
  const updateSettings = useCallback(
    async (partial: DeepPartial<Settings>) => {
      const service = getSettingsService();
      return service.updateSettings(partial);
    },
    [getSettingsService],
  );

  // Reset to default settings
  const resetToDefaults = useCallback(async () => {
    const service = getSettingsService();
    return service.resetToDefaults();
  }, [getSettingsService]);

  // Load a preset (e.g., 'acs')
  const loadPreset = useCallback(
    async (name: string) => {
      const service = getSettingsService();
      return service.loadPreset(name);
    },
    [getSettingsService],
  );

  // Export settings as JSON string
  const exportSettings = useCallback(() => {
    const service = getSettingsService();
    return service.exportSettings();
  }, [getSettingsService]);

  // Import settings from JSON string
  const importSettings = useCallback(
    async (json: string) => {
      const service = getSettingsService();
      return service.importSettings(json);
    },
    [getSettingsService],
  );

  // Get available preset names (safely)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ketcherInstance = (window as any).ketcher;
  const availablePresets =
    ketcherInstance?.settingsService?.getAvailablePresets() || [];
  const isAvailable = !!ketcherInstance?.settingsService;

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
    isAvailable,
  };
}
