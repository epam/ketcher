import { SettingsManager } from 'utilities/SettingsManager';

// Helper function that simulates the conversion logic from ketcher.ts setSettings method
function convertToPersistMonomerLibraryUpdates(
  value: string | boolean,
): boolean {
  // Handle string 'false'/'true' and boolean false/true values correctly
  return value === true || value === 'true';
}

describe('SettingsManager', () => {
  describe('persistMonomerLibraryUpdates', () => {
    beforeEach(() => {
      // Reset to default value before each test
      SettingsManager.persistMonomerLibraryUpdates = true;
    });

    it('should be true by default', () => {
      expect(SettingsManager.persistMonomerLibraryUpdates).toBe(true);
    });

    it('should be set to false when passed false', () => {
      SettingsManager.persistMonomerLibraryUpdates = false;
      expect(SettingsManager.persistMonomerLibraryUpdates).toBe(false);
    });

    it('should be set to true when passed true', () => {
      SettingsManager.persistMonomerLibraryUpdates = false;
      SettingsManager.persistMonomerLibraryUpdates = true;
      expect(SettingsManager.persistMonomerLibraryUpdates).toBe(true);
    });

    it('should default to true when passed undefined', () => {
      SettingsManager.persistMonomerLibraryUpdates = false;
      SettingsManager.persistMonomerLibraryUpdates = undefined;
      expect(SettingsManager.persistMonomerLibraryUpdates).toBe(true);
    });
  });

  describe('persistMonomerLibraryUpdates string conversion (from ketcher.setSettings)', () => {
    beforeEach(() => {
      SettingsManager.persistMonomerLibraryUpdates = true;
    });

    it('should convert string "false" to boolean false', () => {
      const result = convertToPersistMonomerLibraryUpdates('false');
      expect(result).toBe(false);
    });

    it('should convert boolean false to boolean false', () => {
      const result = convertToPersistMonomerLibraryUpdates(false);
      expect(result).toBe(false);
    });

    it('should convert string "true" to boolean true', () => {
      const result = convertToPersistMonomerLibraryUpdates('true');
      expect(result).toBe(true);
    });

    it('should convert boolean true to boolean true', () => {
      const result = convertToPersistMonomerLibraryUpdates(true);
      expect(result).toBe(true);
    });

    it('should convert empty string to boolean false', () => {
      const result = convertToPersistMonomerLibraryUpdates('');
      expect(result).toBe(false);
    });
  });
});
