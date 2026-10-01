import utils from '../utils';

describe('mol serializer utils', () => {
  describe('paddedNum', () => {
    it('formats parsed numeric strings', () => {
      expect(utils.paddedNum('3.14', 6, 2)).toBe('  3.14');
    });
  });

  describe('parseDecimalInt', () => {
    it('parses decimal integers', () => {
      expect(utils.parseDecimalInt('42')).toBe(42);
    });

    it('returns zero for invalid integers', () => {
      expect(utils.parseDecimalInt('abc')).toBe(0);
    });
  });
});
