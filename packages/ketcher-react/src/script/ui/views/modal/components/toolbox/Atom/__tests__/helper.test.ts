import { customQueryValid } from '../helper';
import { CUSTOM_QUERY_MAX_LENGTH } from 'src/script/ui/data/schema/struct-schema';

const OVER_LIMIT = CUSTOM_QUERY_MAX_LENGTH + 1;
const AT_LIMIT = CUSTOM_QUERY_MAX_LENGTH;

describe('customQueryValid', () => {
  describe('when isCustomQuery is false', () => {
    it('returns true regardless of value', () => {
      expect(customQueryValid('', false)).toBe(true);
      expect(customQueryValid('A'.repeat(OVER_LIMIT), false)).toBe(true);
    });
  });

  describe('when isCustomQuery is true', () => {
    it('returns false for empty string', () => {
      expect(customQueryValid('', true)).toBe(false);
    });

    it('returns false when value exceeds limit', () => {
      expect(customQueryValid('A'.repeat(OVER_LIMIT), true)).toBe(false);
    });

    it('returns true when value is exactly at the limit', () => {
      expect(customQueryValid('A'.repeat(AT_LIMIT), true)).toBe(true);
    });

    it('returns true for valid short SMARTS', () => {
      expect(customQueryValid('[CH2]', true)).toBe(true);
    });

    it('returns false for whitespace-only string', () => {
      expect(customQueryValid('   ', true)).toBe(false);
    });
  });
});
