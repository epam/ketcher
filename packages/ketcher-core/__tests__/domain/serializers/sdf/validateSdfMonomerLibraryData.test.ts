import { validateSdfMonomerLibraryData } from 'domain/serializers/sdf/validateSdfMonomerLibraryData';

describe('validateSdfMonomerLibraryData', () => {
  it('does not throw for valid SDF with non-empty modificationTypes', () => {
    const sdf = [
      'header',
      '> <type>',
      'monomerTemplate',
      '> <modificationTypes>',
      'modified',
      '> <name>',
      'TestMonomer',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).not.toThrow();
  });

  it('does not throw when type is not monomerTemplate', () => {
    const sdf = [
      'header',
      '> <type>',
      'otherType',
      '> <modificationTypes>',
      '',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).not.toThrow();
  });

  it('does not throw when modificationTypes field is absent', () => {
    const sdf = [
      'header',
      '> <type>',
      'monomerTemplate',
      '> <name>',
      'TestMonomer',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).not.toThrow();
  });

  it('throws when modificationTypes is empty for a monomerTemplate', () => {
    const sdf = [
      'header',
      '> <type>',
      'monomerTemplate',
      '> <modificationTypes>',
      '',
      '> <name>',
      'BadMonomer',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).toThrow(
      /monomer definition contains invalid modificationTypes value/,
    );
  });

  it('includes sanitized monomer name from <name> field in error', () => {
    const sdf = [
      'header',
      '> <type>',
      'monomerTemplate',
      '> <name>',
      'My<Bad>Monomer',
      '> <modificationTypes>',
      '',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).toThrow(/My_Bad_Monomer/);
  });

  it('falls back to V30 TEMPLATE line for name extraction', () => {
    const sdf = [
      'M  V30 TEMPLATE 1 RNA/Adenine/',
      '> <type>',
      'monomerTemplate',
      '> <modificationTypes>',
      '',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).toThrow(/Adenine/);
  });

  it('reports "unknown" when no name can be extracted', () => {
    const sdf = [
      'header',
      '> <type>',
      'monomerTemplate',
      '> <modificationTypes>',
      '',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).toThrow(
      /Load of "unknown" monomer has failed/,
    );
  });

  it('sanitizes name: truncates to 64 chars and strips special chars', () => {
    const longName = 'A'.repeat(100);
    const sdf = [
      'header',
      '> <type>',
      'monomerTemplate',
      '> <name>',
      longName,
      '> <modificationTypes>',
      '',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).toThrow(
      new RegExp(`"${'A'.repeat(64)}"`),
    );
  });

  it('handles multiple records and only throws on the invalid one', () => {
    const sdf = [
      // Valid record
      '> <type>',
      'monomerTemplate',
      '> <modificationTypes>',
      'validValue',
      '$$$$',
      // Invalid record
      '> <type>',
      'monomerTemplate',
      '> <name>',
      'SecondMonomer',
      '> <modificationTypes>',
      '',
      '$$$$',
    ].join('\n');

    expect(() => validateSdfMonomerLibraryData(sdf)).toThrow(/SecondMonomer/);
  });

  it('is a no-op for empty input', () => {
    expect(() => validateSdfMonomerLibraryData('')).not.toThrow();
  });
});
