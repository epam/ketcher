import {
  DISALLOWED_MONOMER_MODIFICATION_TYPES,
  getDisallowedModificationTypes,
  HELM_ALIAS_MAX_LENGTH,
  isValidHelmAliasLength,
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
});
