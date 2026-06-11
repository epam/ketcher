import {
  HELM_ALIAS_MAX_LENGTH,
  isValidHelmAliasLength,
  isValidMonomerGroupTemplateName,
} from '../../src/utilities/monomers';

describe('monomers utilities', () => {
  describe('isValidMonomerGroupTemplateName', () => {
    it('allows valid preset names', () => {
      expect(isValidMonomerGroupTemplateName('A')).toBe(true);
      expect(isValidMonomerGroupTemplateName('MOE(A)P')).toBe(true);
      expect(isValidMonomerGroupTemplateName('_A1')).toBe(true);
    });

    it('rejects names with invalid characters', () => {
      expect(isValidMonomerGroupTemplateName('#$%@ Space')).toBe(false);
      expect(isValidMonomerGroupTemplateName('InproperCharacters\\//')).toBe(
        false,
      );
      expect(isValidMonomerGroupTemplateName(' ')).toBe(false);
    });
  });

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
});
