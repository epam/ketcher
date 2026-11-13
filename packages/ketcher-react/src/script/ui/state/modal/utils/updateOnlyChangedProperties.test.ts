import { updateOnlyChangedProperties } from './updateOnlyChangedProperties';

describe('updateOnlyChangedProperties', () => {
  it('preserves zero and false updates, but ignores empty strings', () => {
    expect(
      updateOnlyChangedProperties(
        { charge: 1, exactChangeFlag: 1, unsaturatedAtom: 1, label: 'C' },
        { charge: 0, exactChangeFlag: false, unsaturatedAtom: '0', label: '' },
      ),
    ).toEqual({
      charge: 0,
      exactChangeFlag: 0,
      unsaturatedAtom: 0,
      label: 'C',
    });
  });

  it('does not cast properties inherited from the conversion map prototype', () => {
    expect(
      updateOnlyChangedProperties(
        { constructor: 'old', toString: 'old' },
        { constructor: 'new', toString: 'new' },
      ),
    ).toEqual({ constructor: 'new', toString: 'new' });
  });

  it('ignores inherited changes and retains falsy unchanged values', () => {
    const changes = Object.create({ charge: 2 });
    expect(
      updateOnlyChangedProperties(
        { charge: 0, label: '', enabled: false },
        changes,
      ),
    ).toEqual({ charge: 0, label: '', enabled: false });
  });
});
