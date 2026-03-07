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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { useSettings } from '../useSettings';
import { getDefaultSettings } from 'ketcher-core';

// Simple mock store
const createMockStore = (settingsService?: any) => {
  const initialState = {
    editor: { ketcher: { settingsService } },
  };

  const rootReducer = (state = initialState) => state;

  return createStore(rootReducer);
};

// Wrapper component
const createWrapper = (store: any) =>
  function Wrapper({ children }: { children?: any }) {
    return <Provider store={store}>{children}</Provider>;
  };

// Mock settings service
const createMockSettingsService = () => {
  const listeners: Array<(settings: any) => void> = [];
  const mockSettings = getDefaultSettings();

  return {
    getSettings: jest.fn().mockReturnValue(mockSettings),
    updateSettings: jest.fn().mockResolvedValue(mockSettings),
    resetToDefaults: jest.fn().mockResolvedValue(mockSettings),
    loadPreset: jest.fn().mockResolvedValue(mockSettings),
    getAvailablePresets: jest.fn().mockReturnValue(['acs']),
    exportSettings: jest.fn().mockReturnValue(JSON.stringify(mockSettings)),
    importSettings: jest.fn().mockResolvedValue(mockSettings),
    subscribe: jest.fn((listener) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) listeners.splice(index, 1);
      };
    }),
  };
};

describe('useSettings', () => {
  describe('initialization', () => {
    it('should return null settings when service is unavailable', () => {
      const store = createMockStore(undefined);
      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.settings).toBeNull();
      expect(result.current.isAvailable).toBe(false);
    });

    it('should load settings from service on mount', () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.settings).toBeDefined();
      expect(result.current.isAvailable).toBe(true);
      expect(mockService.getSettings).toHaveBeenCalled();
    });

    it('should subscribe to settings changes', () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(mockService.subscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('flat settings structure', () => {
    it('should return settings with flat structure', () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.settings).toBeDefined();
      expect(result.current.settings).toHaveProperty('resetToSelect');
      expect(result.current.settings).toHaveProperty('atomColoring');
      expect(result.current.settings).toHaveProperty('smart-layout');
    });
  });

  describe('updateSettings', () => {
    it('should call service updateSettings with flat format', async () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      const partial = { resetToSelect: false };

      await act(async () => {
        await result.current.updateSettings(partial);
      });

      expect(mockService.updateSettings).toHaveBeenCalledWith(partial);
    });

    it('should throw error when service unavailable', async () => {
      const store = createMockStore(undefined);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      await expect(async () => {
        await result.current.updateSettings({
          resetToSelect: false,
        });
      }).rejects.toThrow('Settings service not available');
    });
  });

  describe('resetToDefaults', () => {
    it('should call service resetToDefaults', async () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.resetToDefaults();
      });

      expect(mockService.resetToDefaults).toHaveBeenCalled();
    });
  });

  describe('loadPreset', () => {
    it('should call service loadPreset with preset name', async () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      await act(async () => {
        await result.current.loadPreset('acs');
      });

      expect(mockService.loadPreset).toHaveBeenCalledWith('acs');
    });
  });

  describe('exportSettings', () => {
    it('should call service exportSettings', () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      const exported = result.current.exportSettings();

      expect(mockService.exportSettings).toHaveBeenCalled();
      expect(typeof exported).toBe('string');
    });
  });

  describe('importSettings', () => {
    it('should call service importSettings with flat JSON', async () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      const json = '{"resetToSelect":false}';

      await act(async () => {
        await result.current.importSettings(json);
      });

      expect(mockService.importSettings).toHaveBeenCalledWith(json);
    });
  });

  describe('availablePresets', () => {
    it('should return available presets from service', () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.availablePresets).toEqual(['acs']);
    });

    it('should return empty array when service unavailable', () => {
      const store = createMockStore(undefined);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.availablePresets).toEqual([]);
    });
  });

  describe('isAvailable', () => {
    it('should return true when service is available', () => {
      const mockService = createMockSettingsService();
      const store = createMockStore(mockService);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isAvailable).toBe(true);
    });

    it('should return false when service is unavailable', () => {
      const store = createMockStore(undefined);

      const { result } = renderHook(() => useSettings(), {
        wrapper: createWrapper(store),
      });

      expect(result.current.isAvailable).toBe(false);
    });
  });
});
