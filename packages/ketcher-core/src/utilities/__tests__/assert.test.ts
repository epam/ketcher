import { assert } from '../assert';

describe('assert', () => {
  it.each([false, 0, -0, 0n, '', null, undefined, Number.NaN])(
    'throws for falsy value %p',
    (value) => {
      expect(() => assert(value)).toThrow('Assertion failed');
    },
  );

  it.each([true, 1, -1, 1n, 'text', {}, [], Symbol('x')])(
    'does not throw for truthy value %p',
    (value) => {
      expect(() => assert(value)).not.toThrow();
    },
  );

  it('throws with a custom message when provided', () => {
    expect(() => assert(false, 'Custom failure')).toThrow('Custom failure');
  });

  it('uses an empty string when provided as a custom message', () => {
    expect(() => assert(false, '')).toThrow('');
  });
});
