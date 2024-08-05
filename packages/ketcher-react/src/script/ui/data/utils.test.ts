import { matchCharge } from 'src/script/ui/data/utils';

describe('data utils', () => {
  describe('matchCharge', () => {
    it('should return null for empty string', () => {
      const result = matchCharge('');
      expect(result).toBeNull();
    });
    it('should return null for string with positive out of range charge', () => {
      const result = matchCharge('16');
      expect(result).toBeNull();
    });
    it('should return null for string with negative out of range charge', () => {
      const result = matchCharge('-16');
      expect(result).toBeNull();
    });
    it('should return expected matched array for string with zero charge', () => {
      const expectedMatchGroups = ['', '0', ''];
      const [, signBefore, absoluteValue, signAfter] = matchCharge('0') || [];
      expect([signBefore, absoluteValue, signAfter]).toEqual(
        expectedMatchGroups,
      );
    });
    it('should return expected matched array for string with negative zero charge', () => {
      const expectedMatchGroups = ['-', '0', ''];
      const [, signBefore, absoluteValue, signAfter] = matchCharge('-0') || [];
      expect([signBefore, absoluteValue, signAfter]).toEqual(
        expectedMatchGroups,
      );
    });
    it('should return expected matched array for string with negative zero charge after', () => {
      const expectedMatchGroups = ['', '0', '-'];
      const [, signBefore, absoluteValue, signAfter] = matchCharge('0-') || [];
      expect([signBefore, absoluteValue, signAfter]).toEqual(
        expectedMatchGroups,
      );
    });
    it('should return expected matched array for string with two signs number', () => {
      const expectedMatchGroups = ['-', '0', '-'];
      const [, signBefore, absoluteValue, signAfter] = matchCharge('-0-') || [];
      expect([signBefore, absoluteValue, signAfter]).toEqual(
        expectedMatchGroups,
      );
    });
    it('should return null for string with invalid number format', () => {
      const result = matchCharge('--0');
      expect(result).toBeNull();
    });
  });
});
