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
import {
  type Settings,
  type DeepPartial,
  type ISettingsService,
  ketcherProvider,
} from 'ketcher-core';
import { useAppContext } from 'src/hooks/useAppContext';

const findSettingsService = (
  ketcherId: string,
): ISettingsService | undefined => {
  const ketcherInstance = ketcherProvider.getKetcher(ketcherId);

  return ketcherInstance?.settingsService;
};

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
  const { ketcherId } = useAppContext();

  // Local state for settings (synced from service)
  const [settings, setSettings] = useState<Settings | null>(null);

  // Subscribe to settings changes from core
  useEffect(() => {
    const settingsService = findSettingsService(ketcherId);

    if (!settingsService) {
      return;
    }

    const syncSettings = (newSettings: Settings) => {
      setSettings(newSettings);
      dispatch(syncSettingsFromCore(newSettings));
    };

    const unsubscribe = settingsService.subscribe(syncSettings);

    syncSettings(settingsService.getSettings());

    return unsubscribe;
  }, [dispatch, ketcherId]);

  // Helper to get settings service
  const getSettingsService = useCallback(() => {
    const settingsService = findSettingsService(ketcherId);

    if (!settingsService) {
      throw new Error('Settings service not available');
    }

    return settingsService;
  }, [ketcherId]);

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
  const settingsService = findSettingsService(ketcherId);
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
  };
}
