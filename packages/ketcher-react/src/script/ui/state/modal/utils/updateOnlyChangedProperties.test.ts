import { updateOnlyChangedProperties } from './updateOnlyChangedProperties';

describe('updateOnlyChangedProperties', () => {
  it('casts only mapped properties and preserves prototype-named values', () => {
    const original = { exactChangeFlag: 0, toString: 'old', label: 'old' };
    const changes = { exactChangeFlag: '0', toString: 'new', label: '' };

    expect(updateOnlyChangedProperties(original, changes)).toEqual({
      exactChangeFlag: 0,
      toString: 'new',
      label: 'old',
    });
  });
});
