import { serialize, deserialize } from './labeledit';

describe('serialize', () => {
  it('should serialize a simple label', () => {
    expect(
      serialize({ label: 'C', charge: null, isotope: null, radical: 0 }),
    ).toBe('C');
  });

  it('should serialize label with positive charge', () => {
    expect(
      serialize({ label: 'N', charge: 1, isotope: null, radical: 0 }),
    ).toBe('N+');
  });

  it('should serialize label with negative charge', () => {
    expect(
      serialize({ label: 'O', charge: -1, isotope: null, radical: 0 }),
    ).toBe('O-');
  });

  it('should serialize label with charge > 1', () => {
    expect(
      serialize({ label: 'Fe', charge: 3, isotope: null, radical: 0 }),
    ).toBe('Fe3+');
  });

  it('should serialize label with isotope', () => {
    expect(
      serialize({ label: 'C', charge: null, isotope: 14, radical: 0 }),
    ).toBe('14C');
  });

  it('should serialize label with radical', () => {
    expect(
      serialize({ label: 'N', charge: null, isotope: null, radical: 1 }),
    ).toBe('N:');
    expect(
      serialize({ label: 'N', charge: null, isotope: null, radical: 2 }),
    ).toBe('N.');
    expect(
      serialize({ label: 'N', charge: null, isotope: null, radical: 3 }),
    ).toBe('N^^');
  });

  it('should serialize label with all properties', () => {
    expect(serialize({ label: 'C', charge: -2, isotope: 13, radical: 1 })).toBe(
      '13C:2-',
    );
  });
});

describe('deserialize', () => {
  it('should deserialize a simple label', () => {
    expect(deserialize('C')).toEqual({
      label: 'C',
      charge: null,
      isotope: null,
      radical: 0,
    });
  });

  it('should deserialize label with positive charge', () => {
    expect(deserialize('N+')).toEqual({
      label: 'N',
      charge: 1,
      isotope: null,
      radical: 0,
    });
  });

  it('should deserialize label with negative charge', () => {
    expect(deserialize('O-')).toEqual({
      label: 'O',
      charge: -1,
      isotope: null,
      radical: 0,
    });
  });

  it('should deserialize label with numeric charge', () => {
    expect(deserialize('Fe3+')).toEqual({
      label: 'Fe',
      charge: 3,
      isotope: null,
      radical: 0,
    });
  });

  it('should deserialize label with isotope', () => {
    expect(deserialize('14C')).toEqual({
      label: 'C',
      charge: null,
      isotope: 14,
      radical: 0,
    });
  });

  it('should deserialize label with radical', () => {
    expect(deserialize('N:')).toEqual({
      label: 'N',
      charge: null,
      isotope: null,
      radical: 1,
    });
    expect(deserialize('N.')).toEqual({
      label: 'N',
      charge: null,
      isotope: null,
      radical: 2,
    });
  });

  it('should deserialize wildcard as A', () => {
    expect(deserialize('*')).toEqual({
      label: 'A',
      charge: null,
      isotope: null,
      radical: 0,
    });
  });

  it('should return null for invalid input', () => {
    expect(deserialize('')).toBeNull();
    expect(deserialize('123')).toBeNull();
    expect(deserialize('Zzzz')).toBeNull();
  });

  it('should return null for unknown element labels', () => {
    expect(deserialize('Zz')).toBeNull();
  });

  it('should deserialize generic labels', () => {
    expect(deserialize('Q')).toEqual({
      label: 'Q',
      charge: null,
      isotope: null,
      radical: 0,
    });
    expect(deserialize('X')).toEqual({
      label: 'X',
      charge: null,
      isotope: null,
      radical: 0,
    });
    expect(deserialize('M')).toEqual({
      label: 'M',
      charge: null,
      isotope: null,
      radical: 0,
    });
  });
});
