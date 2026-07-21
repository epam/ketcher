import {
  MonomerNameValidationErrorType,
  validateMonomerName,
} from '../helpers';
import { MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH } from 'utilities';

describe('validateMonomerName', () => {
  describe('positive scenarios', () => {
    it('should return isValid: true for a valid name', () => {
      expect(validateMonomerName('Valid-Monomer_Name*1')).toEqual({
        isValid: true,
      });
    });

    it('should return isValid: true for a name at the max length', () => {
      const name = 'a'.repeat(MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH);
      expect(validateMonomerName(name)).toEqual({ isValid: true });
    });
  });

  describe('negative scenarios', () => {
    it('should return an Empty error for an empty string', () => {
      expect(validateMonomerName('')).toEqual({
        isValid: false,
        error: MonomerNameValidationErrorType.Empty,
      });
    });

    it('should return an Empty error for a whitespace-only string', () => {
      expect(validateMonomerName('   ')).toEqual({
        isValid: false,
        error: MonomerNameValidationErrorType.Empty,
      });
    });

    it('should return a TooLong error for a name exceeding the max length', () => {
      const name = 'a'.repeat(MONOMER_GROUP_TEMPLATE_NAME_MAX_LENGTH + 1);
      expect(validateMonomerName(name)).toEqual({
        isValid: false,
        error: MonomerNameValidationErrorType.TooLong,
      });
    });

    it.each([
      'name with spaces',
      'name.with.dots',
      'name!with!exclamation',
      'name?with?questions',
      'name/with/slash',
      'name@with@at',
      'name\nwith\nnewline',
      'name#with#hash',
      'name$with$dollar',
      'name%with%percent',
    ])('should return an InvalidCharacters error for %s', (name) => {
      expect(validateMonomerName(name)).toEqual({
        isValid: false,
        error: MonomerNameValidationErrorType.InvalidCharacters,
      });
    });
  });
});
