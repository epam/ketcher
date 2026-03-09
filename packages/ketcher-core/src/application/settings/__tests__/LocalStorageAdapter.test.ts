/**
 * Unit tests for LocalStorageAdapter
 */

import { LocalStorageAdapter } from '../LocalStorageAdapter';
import type { Settings } from '../types';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    adapter = new LocalStorageAdapter();

    // Mock localStorage
    mockLocalStorage = {};

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
      },
      writable: true,
    });
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(adapter.isAvailable()).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      expect(adapter.isAvailable()).toBe(false);
    });
  });

  describe('load', () => {
    it('should load settings from localStorage', async () => {
      const testSettings = {
        editor: { resetToSelect: false },
        render: { atomColoring: true },
      };

      mockLocalStorage['test-key'] = JSON.stringify(testSettings);

      const loaded = await adapter.load('test-key');

      expect(loaded).toEqual(testSettings);
    });

    it('should return null when key does not exist', async () => {
      const loaded = await adapter.load('non-existent-key');

      expect(loaded).toBeNull();
    });

    it('should return null on invalid JSON', async () => {
      mockLocalStorage['test-key'] = 'invalid json';

      const loaded = await adapter.load('test-key');

      expect(loaded).toBeNull();
    });

    it('should return null when localStorage is not available', async () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      const newAdapter = new LocalStorageAdapter();
      const loaded = await newAdapter.load('test-key');

      expect(loaded).toBeNull();
    });
  });

  describe('save', () => {
    it('should save settings to localStorage', async () => {
      const testSettings: Partial<Settings> = {
        resetToSelect: false,
        rotationStep: 15,
        atomColoring: true,
        font: '30px Arial',
        fontsz: 13,
        fontszUnit: 'px',
        fontszsub: 13,
        showStereoFlags: true,
        stereoLabelStyle: 'IUPAC',
        colorOfAbsoluteCenters: '#ff0000',
        colorOfAndCenters: '#0000cd',
        colorOfOrCenters: '#228b22',
        colorStereogenicCenters: 'LabelsOnly',
        autoFadeOfStereoLabels: true,
        absFlagLabel: 'ABS',
        andFlagLabel: 'AND',
        orFlagLabel: 'OR',
        mixedFlagLabel: 'Mixed',
        ignoreChiralFlag: false,
        carbonExplicitly: false,
        showCharge: true,
        showValence: true,
        showHydrogenLabels: 'Terminal and Hetero',
        aromaticCircle: true,
        bondSpacing: 15,
        bondLength: 40,
        bondLengthUnit: 'px',
        bondThickness: 1.2,
        bondThicknessUnit: 'px',
        stereoBondWidth: 6,
        stereoBondWidthUnit: 'px',
        hashSpacing: 1.2,
        hashSpacingUnit: 'px',
        imageResolution: 72,
        reactionComponentMarginSize: 20,
        showValenceWarnings: true,
      };

      await adapter.save('test-key', testSettings as Settings);

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testSettings),
      );
      expect(mockLocalStorage['test-key']).toBeDefined();
    });

    it('should throw error when localStorage is not available', async () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      const newAdapter = new LocalStorageAdapter();

      await expect(
        newAdapter.save('test-key', {} as Settings),
      ).rejects.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear settings from localStorage', async () => {
      mockLocalStorage['test-key'] = 'some data';

      await adapter.clear('test-key');

      expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
      expect(mockLocalStorage['test-key']).toBeUndefined();
    });

    it('should not throw when localStorage is not available', async () => {
      Object.defineProperty(global, 'localStorage', {
        get: () => {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      const newAdapter = new LocalStorageAdapter();

      await expect(newAdapter.clear('test-key')).resolves.not.toThrow();
    });
  });
});
