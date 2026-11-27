import { applySchemaDefaults } from './form';

describe('applySchemaDefaults', () => {
  it('creates an own __proto__ default without changing the state prototype', () => {
    const defaultValue = { marker: true };
    const schema = {
      properties: { ['__proto__']: { default: defaultValue } },
    };

    const result = applySchemaDefaults({}, schema);

    expect(Object.getPrototypeOf(result)).toBe(Object.prototype);
    expect(Object.hasOwn(result, '__proto__')).toBe(true);
    expect(Object.getOwnPropertyDescriptor(result, '__proto__')?.value).toBe(
      defaultValue,
    );
    expect(Object.keys(result)).toEqual(['__proto__']);
  });

  it('preserves existing falsy values', () => {
    const schema = {
      properties: {
        count: { default: 10 },
        enabled: { default: true },
        name: { default: 'default' },
      },
    };

    expect(
      applySchemaDefaults({ count: 0, enabled: false, name: '' }, schema),
    ).toEqual({ count: 0, enabled: false, name: '' });
  });
});
