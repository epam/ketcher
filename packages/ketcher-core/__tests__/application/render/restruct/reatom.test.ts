import {
  checkIsSmartPropertiesExist,
  getAtomCustomQuery,
} from 'application/render/restruct';
import { Atom } from 'domain/entities';

describe('atom query properties rendering', () => {
  it.each([
    { implicitHCount: 0, expected: 'h0' },
    {
      queryProperties: { ringMembership: 0 },
      expected: 'R0',
    },
    {
      queryProperties: { ringSize: 0 },
      expected: 'r0',
    },
    {
      queryProperties: { connectivity: 0 },
      expected: 'X0',
    },
  ])('renders $expected for a zero-valued query property', (attributes) => {
    const atom = new Atom({
      label: 'C',
      ...attributes,
    });

    expect(checkIsSmartPropertiesExist(atom)).toBe(true);
    expect(
      getAtomCustomQuery({
        ...atom,
        ...atom.queryProperties,
      }),
    ).toBe(attributes.expected);
  });
});
