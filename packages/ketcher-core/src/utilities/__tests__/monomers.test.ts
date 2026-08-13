import {
  getDisallowedModificationTypes,
  isValidIdtAlias,
  isValidIdtAliasLength,
  getTooLongIdtAliasEntries,
  isValidHelmAlias,
  isValidBilnAlias,
  isValidHelmAliasLength,
  IDT_ALIAS_LENGTH_MAX,
  HELM_ALIAS_MAX_LENGTH,
} from '../monomers';

describe('getDisallowedModificationTypes', () => {
  it('returns empty array when called with undefined', () => {
    expect(getDisallowedModificationTypes(undefined)).toEqual([]);
  });

  it('returns empty array when called with a non-array value', () => {
    // @ts-expect-error: intentionally testing malformed runtime input
    expect(getDisallowedModificationTypes('Unknown base')).toEqual([]);
  });

  it('returns empty array when all types are allowed (not in the disallowed list)', () => {
    // Use strings that are intentionally not in DISALLOWED_MONOMER_MODIFICATION_TYPES
    expect(
      getDisallowedModificationTypes(['Standard peptide', 'Natural sugar']),
    ).toEqual([]);
  });

  it('returns disallowed types that are present', () => {
    expect(
      getDisallowedModificationTypes(['Unknown base', 'CustomPeptide']),
    ).toEqual(['Unknown base']);
  });

  it('returns all matching disallowed types', () => {
    expect(
      getDisallowedModificationTypes([
        'Unknown base',
        'Molecule',
        'Micromolecule',
      ]),
    ).toEqual(['Unknown base', 'Molecule', 'Micromolecule']);
  });

  it('returns empty array for an empty input array', () => {
    expect(getDisallowedModificationTypes([])).toEqual([]);
  });
});

describe('isValidIdtAlias', () => {
  it('returns true for an empty string', () => {
    expect(isValidIdtAlias('')).toBe(true);
  });

  it('returns true for alias with no slashes', () => {
    expect(isValidIdtAlias('mA')).toBe(true);
  });

  it('returns true when slash is only the first character', () => {
    expect(isValidIdtAlias('/mA')).toBe(true);
  });

  it('returns true when slash is only the last character', () => {
    expect(isValidIdtAlias('mA/')).toBe(true);
  });

  it('returns true when slash appears as both first and last character', () => {
    expect(isValidIdtAlias('/mA/')).toBe(true);
  });

  it('returns false when a slash appears in the middle', () => {
    expect(isValidIdtAlias('m/A')).toBe(false);
  });

  it('returns false when slash appears after the first character but before the last', () => {
    expect(isValidIdtAlias('/m/A/')).toBe(false);
  });
});

describe('isValidIdtAliasLength', () => {
  it('returns true for an empty string', () => {
    expect(isValidIdtAliasLength('')).toBe(true);
  });

  it('returns true when alias without slashes is within the limit', () => {
    const alias = 'A'.repeat(IDT_ALIAS_LENGTH_MAX);
    expect(isValidIdtAliasLength(alias)).toBe(true);
  });

  it('returns false when alias without slashes exceeds the limit', () => {
    const alias = 'A'.repeat(IDT_ALIAS_LENGTH_MAX + 1);
    expect(isValidIdtAliasLength(alias)).toBe(false);
  });

  it('strips leading and trailing slashes before checking length', () => {
    const inner = 'A'.repeat(IDT_ALIAS_LENGTH_MAX);
    expect(isValidIdtAliasLength(`/${inner}/`)).toBe(true);
    const tooLong = 'A'.repeat(IDT_ALIAS_LENGTH_MAX + 1);
    expect(isValidIdtAliasLength(`/${tooLong}/`)).toBe(false);
  });
});

describe('getTooLongIdtAliasEntries', () => {
  it('returns empty array when all aliases are within the length limit', () => {
    expect(
      getTooLongIdtAliasEntries({ base: 'mA', modifications: undefined }),
    ).toEqual([]);
  });

  it('reports the base alias when it is too long', () => {
    const longBase = 'A'.repeat(IDT_ALIAS_LENGTH_MAX + 1);
    const result = getTooLongIdtAliasEntries({ base: longBase });
    expect(result).toEqual([{ alias: 'base', value: longBase }]);
  });

  it('reports a modification alias when it is too long', () => {
    const longAlias = 'A'.repeat(IDT_ALIAS_LENGTH_MAX + 1);
    const result = getTooLongIdtAliasEntries({
      base: 'mA',
      modifications: { internal: longAlias },
    });
    expect(result).toEqual([{ alias: 'internal', value: longAlias }]);
  });

  it('ignores absent modification aliases', () => {
    const result = getTooLongIdtAliasEntries({
      base: 'mA',
      modifications: { endpoint3: undefined, endpoint5: undefined },
    });
    expect(result).toEqual([]);
  });

  it('reports multiple too-long entries', () => {
    const longAlias = 'A'.repeat(IDT_ALIAS_LENGTH_MAX + 1);
    const result = getTooLongIdtAliasEntries({
      base: longAlias,
      modifications: { internal: longAlias },
    });
    expect(result).toHaveLength(2);
  });
});

describe('isValidHelmAlias', () => {
  it('returns true for a valid HELM alias', () => {
    expect(isValidHelmAlias('mA')).toBe(true);
    expect(isValidHelmAlias('Peptide1')).toBe(true);
    expect(isValidHelmAlias('[mA]')).toBe(true);
    expect(isValidHelmAlias('A*')).toBe(true);
  });

  it('returns false when the alias contains spaces', () => {
    expect(isValidHelmAlias('m A')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidHelmAlias('')).toBe(false);
  });

  it('returns false when the alias contains invalid characters', () => {
    expect(isValidHelmAlias('mA!')).toBe(false);
    expect(isValidHelmAlias('mA#')).toBe(false);
  });
});

describe('isValidBilnAlias', () => {
  it('returns true for a valid BILN alias', () => {
    expect(isValidBilnAlias('mA')).toBe(true);
    expect(isValidBilnAlias('A_1')).toBe(true);
    expect(isValidBilnAlias('A*')).toBe(true);
    expect(isValidBilnAlias('A-1')).toBe(true);
  });

  it('returns false when the alias contains spaces', () => {
    expect(isValidBilnAlias('m A')).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(isValidBilnAlias('')).toBe(false);
  });

  it('returns false for characters not allowed in BILN aliases', () => {
    expect(isValidBilnAlias('mA.')).toBe(false);
    expect(isValidBilnAlias('[mA]')).toBe(false);
  });
});

describe('isValidHelmAliasLength', () => {
  it('returns true when alias is within the maximum length', () => {
    const alias = 'A'.repeat(HELM_ALIAS_MAX_LENGTH);
    expect(isValidHelmAliasLength(alias)).toBe(true);
  });

  it('returns false when alias exceeds the maximum length', () => {
    const alias = 'A'.repeat(HELM_ALIAS_MAX_LENGTH + 1);
    expect(isValidHelmAliasLength(alias)).toBe(false);
  });

  it('returns true for an empty string', () => {
    expect(isValidHelmAliasLength('')).toBe(true);
  });
});
