import {
  getMonomerLibraryHelmAliasLoadFailedMessage,
  isValidMonomerLibraryHelmAliasForUpdate,
} from 'domain/helpers/monomerLibraryValidation';

describe('monomerLibraryValidation', () => {
  describe('isValidMonomerLibraryHelmAliasForUpdate', () => {
    it('accepts missing alias and rejects invalid provided values', () => {
      expect(isValidMonomerLibraryHelmAliasForUpdate(undefined)).toBe(true);
      expect(isValidMonomerLibraryHelmAliasForUpdate(null)).toBe(false);
      expect(isValidMonomerLibraryHelmAliasForUpdate(1)).toBe(false);
      expect(isValidMonomerLibraryHelmAliasForUpdate('')).toBe(false);
      expect(isValidMonomerLibraryHelmAliasForUpdate('   ')).toBe(false);
      expect(isValidMonomerLibraryHelmAliasForUpdate('a b')).toBe(false);
      expect(isValidMonomerLibraryHelmAliasForUpdate('a@b')).toBe(false);
    });

    it('accepts allowed characters', () => {
      expect(isValidMonomerLibraryHelmAliasForUpdate('p')).toBe(true);
      expect(isValidMonomerLibraryHelmAliasForUpdate('Ab-12_x*')).toBe(true);
    });
  });

  describe('getMonomerLibraryHelmAliasLoadFailedMessage', () => {
    it('includes monomer name and HELM rules sentence', () => {
      const msg = getMonomerLibraryHelmAliasLoadFailedMessage('_Phosphate1');
      expect(msg).toContain('Load of "_Phosphate1" monomer has failed');
      expect(msg).toContain(
        'The HELM alias must consist only of uppercase and lowercase letters',
      );
    });
  });
});
