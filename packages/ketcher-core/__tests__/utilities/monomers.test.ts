import {
  DISALLOWED_MONOMER_MODIFICATION_TYPES,
  getDisallowedModificationTypes,
  HELM_ALIAS_MAX_LENGTH,
  isValidHelmAliasLength,
  isValidModificationTypes,
  MODIFICATION_TYPES_MAX_LENGTH,
} from '../../src/utilities/monomers';

describe('monomers utilities', () => {
  describe('isValidHelmAliasLength', () => {
    it('allows HELM aliases up to the maximum length', () => {
      expect(isValidHelmAliasLength('A'.repeat(HELM_ALIAS_MAX_LENGTH))).toBe(
        true,
      );
    });

    it('rejects HELM aliases longer than the maximum length', () => {
      expect(
        isValidHelmAliasLength('A'.repeat(HELM_ALIAS_MAX_LENGTH + 1)),
      ).toBe(false);
    });
  });

  describe('getDisallowedModificationTypes', () => {
    it.each(DISALLOWED_MONOMER_MODIFICATION_TYPES)(
      'flags the disallowed modification type "%s"',
      (modificationType) => {
        expect(getDisallowedModificationTypes([modificationType])).toEqual([
          modificationType,
        ]);
      },
    );

    it('returns an empty array for allowed modification types', () => {
      expect(
        getDisallowedModificationTypes([
          'Natural amino acid',
          'Phosphorylation',
        ]),
      ).toEqual([]);
    });

    it('returns only the disallowed types from a mixed list', () => {
      expect(
        getDisallowedModificationTypes(['Natural amino acid', 'Unknown base']),
      ).toEqual(['Unknown base']);
    });

    it('returns an empty array when modification types are missing or empty', () => {
      expect(getDisallowedModificationTypes()).toEqual([]);
      expect(getDisallowedModificationTypes([])).toEqual([]);
    });

    it('returns an empty array for malformed (non-array) modification types', () => {
      // The value comes from parsed, untrusted library JSON, so it may not be an
      // array at runtime (e.g. a bare string). The guard must return an empty
      // result rather than throwing a TypeError.
      expect(
        getDisallowedModificationTypes('Unknown base' as unknown as string[]),
      ).toEqual([]);
      expect(
        getDisallowedModificationTypes(null as unknown as string[]),
      ).toEqual([]);
    });
  });

  describe('isValidModificationTypes', () => {
    it('returns true when modificationTypes is undefined (optional field)', () => {
      expect(isValidModificationTypes(undefined)).toBe(true);
    });

    it('returns true when modificationTypes is not an array', () => {
      expect(
        isValidModificationTypes('not an array' as unknown as string[]),
      ).toBe(true);
    });

    it('returns true for valid modification types with spaces', () => {
      expect(isValidModificationTypes(['Natural amino acid'])).toBe(true);
      expect(isValidModificationTypes(['Type 1', 'Type 2 with spaces'])).toBe(
        true,
      );
    });

    it('returns true for non-empty modification types', () => {
      expect(isValidModificationTypes(['Phosphorylation'])).toBe(true);
      expect(isValidModificationTypes(['A', 'B', 'C'])).toBe(true);
    });

    it('returns false for empty array', () => {
      expect(isValidModificationTypes([])).toBe(false);
    });

    it('returns false for modification types containing only whitespace', () => {
      expect(isValidModificationTypes([' '])).toBe(false);
      expect(isValidModificationTypes(['  ', '   '])).toBe(false);
    });

    it('returns false for modification types containing only formatting characters', () => {
      expect(isValidModificationTypes(['\t'])).toBe(false);
      expect(isValidModificationTypes(['\n'])).toBe(false);
      expect(isValidModificationTypes(['\r'])).toBe(false);
      expect(isValidModificationTypes(['\t', '\n', '\r'])).toBe(false);
    });

    it('returns false for modification types containing only whitespace and formatting characters', () => {
      expect(isValidModificationTypes(['\t '])).toBe(false);
      expect(isValidModificationTypes([' \t \n '])).toBe(false);
      expect(isValidModificationTypes(['\t ', '  \n  '])).toBe(false);
    });

    it('returns true for modification types with semicolon (valid non-whitespace character)', () => {
      expect(isValidModificationTypes([';'])).toBe(true);
      expect(isValidModificationTypes(['\t', ' ', ';'])).toBe(true);
    });

    it('returns true when modificationTypes contains valid characters with whitespace', () => {
      // Semicolon is a valid non-whitespace character, even with surrounding whitespace
      expect(isValidModificationTypes(['\t ;'])).toBe(true);
      expect(isValidModificationTypes(['  valid  '])).toBe(true);
    });

    it('returns false when backend parses semicolon-delimited empty values', () => {
      // If backend parses "\t ;" as array with empty elements (e.g., ['\t ', ''])
      expect(isValidModificationTypes(['\t ', ''])).toBe(false);
      expect(isValidModificationTypes(['', ''])).toBe(false);
      expect(isValidModificationTypes(['', '\t', ''])).toBe(false);
    });

    it('returns false when total length exceeds max length', () => {
      const longValue = 'A'.repeat(MODIFICATION_TYPES_MAX_LENGTH + 1);
      expect(isValidModificationTypes([longValue])).toBe(false);
    });

    it('returns true when total length is at max length', () => {
      const maxLengthValue = 'A'.repeat(MODIFICATION_TYPES_MAX_LENGTH);
      expect(isValidModificationTypes([maxLengthValue])).toBe(true);
    });

    it('returns false when sum of multiple elements exceeds max length', () => {
      // Each element is 101 chars, total 202 > 200
      const value1 = 'A'.repeat(101);
      const value2 = 'B'.repeat(101);
      expect(isValidModificationTypes([value1, value2])).toBe(false);
    });

    it('returns true when sum of multiple elements is within max length', () => {
      // Each element is 100 chars, total 200 = 200
      const value1 = 'A'.repeat(100);
      const value2 = 'B'.repeat(100);
      expect(isValidModificationTypes([value1, value2])).toBe(true);
    });

    it('returns true for modification types with semicolons and special characters', () => {
      expect(isValidModificationTypes(['Type;1', 'Type-2'])).toBe(true);
    });
  });
});
