import { getAtomQueryLabelText } from 'application/render/restruct/atomQueryText';

describe('getAtomQueryLabelText', () => {
  it('returns empty text for an atom without query properties', () => {
    expect(getAtomQueryLabelText({})).toBe('');
  });

  it('joins the query properties', () => {
    expect(
      getAtomQueryLabelText({
        ringBondCount: 2,
        substitutionCount: -1,
        unsaturatedAtom: 1,
        hCount: 2,
      }),
    ).toBe('rb2;s0;u;H1');
  });

  it('uses the custom query if it is set', () => {
    expect(
      getAtomQueryLabelText({
        ringBondCount: 2,
        queryProperties: { customQuery: 'x2&D3,D2' },
      }),
    ).toBe('x2&D3,D2');
  });
});
