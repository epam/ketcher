import {
  fromSgroup,
  fromStereoLabel,
  toSgroup,
  type SGroupInput,
} from './structconv';

describe('fromStereoLabel', () => {
  it('returns no type for a null label', () => {
    expect(fromStereoLabel(null)).toEqual({ type: null });
  });

  it.each(['', '123'])(
    'preserves label "%s" when there is no non-digit match',
    (label) => {
      expect(fromStereoLabel(label)).toEqual({
        type: label,
        orNumber: 0,
        andNumber: 0,
      });
    },
  );

  it.each([
    ['abs', { type: 'abs', orNumber: 1, andNumber: 1 }],
    ['&2', { type: '&', orNumber: 1, andNumber: 2 }],
    ['or3', { type: 'or', orNumber: 3, andNumber: 1 }],
    ['invalid', { type: null }],
  ])('converts stereo label "%s"', (label, expected) => {
    expect(fromStereoLabel(label)).toEqual(expected);
  });
});

describe('mixture S-groups in the S-group dialog', () => {
  const attrs: SGroupInput['attrs'] = {
    context: 'Multifragment',
    fieldName: '',
    fieldValue: '',
  };

  it.each(['FOR', 'MIX'])(
    'opens a %s S-group as the type Mixture with its subtype',
    (type) => {
      expect(fromSgroup({ type, attrs: { ...attrs } })).toMatchObject({
        type: 'mixture',
        mixtureType: type,
      });
    },
  );

  it.each(['FOR', 'MIX'])(
    'creates a %s S-group from the selected subtype',
    (mixtureType) => {
      expect(
        toSgroup({ type: 'mixture', mixtureType, context: 'Multifragment' }),
      ).toEqual({ type: mixtureType, attrs: {} });
    },
  );

  it.each([undefined, 'ran'])(
    'refuses a mixture with the subtype %s',
    (mixtureType) => {
      expect(() => toSgroup({ type: 'mixture', mixtureType })).toThrow(
        'Unknown mixture subtype',
      );
    },
  );

  it('keeps the subtype of a copolymer as an attribute', () => {
    expect(toSgroup({ type: 'COP', subtype: 'ran' })).toEqual({
      type: 'COP',
      attrs: { subtype: 'ran' },
    });
  });
});
