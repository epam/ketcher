import {
  DISALLOWED_MONOMER_MODIFICATION_TYPES,
  buildIdtAliasesFromWizardInputs,
  expandIdtAliasesToWizardInputs,
  getDisallowedModificationTypes,
  HELM_ALIAS_MAX_LENGTH,
  isValidHelmAliasLength,
  isValidIdtAliasFormat,
  isValidModificationTypes,
  MODIFICATION_TYPES_MAX_LENGTH,
} from '../../src/utilities/monomers';

describe('monomers utilities', () => {
  describe('isValidHelmAliasLength', () => {
    it('allows HELM aliases up to the maximum length', () => {
      expect(isValidHelmAliasLength('A'.repeat(HELM_ALIAS_MAX_LENGTH))).toBe(
        true,
      );
    });

    it('rejects HELM aliases longer than the maximum length', () => {
      expect(
        isValidHelmAliasLength('A'.repeat(HELM_ALIAS_MAX_LENGTH + 1)),
      ).toBe(false);
    });
  });

  describe('isValidIdtAliasFormat', () => {
    it.each(['Sp18', '5Sp18', '/5Sp18/', 'A_b-9/', 'aZ0_-/'])(
      'accepts valid IDT alias "%s"',
      (alias) => {
        expect(isValidIdtAliasFormat(alias)).toBe(true);
      },
    );

    it.each(['Sp 18', '5Sp18*', 'has space', 'bad!', 'foo@bar'])(
      'rejects invalid IDT alias "%s"',
      (alias) => {
        expect(isValidIdtAliasFormat(alias)).toBe(false);
      },
    );

    it('accepts empty string', () => {
      expect(isValidIdtAliasFormat('')).toBe(true);
    });
  });

  describe('buildIdtAliasesFromWizardInputs', () => {
    it('returns undefined when all inputs are empty', () => {
      expect(buildIdtAliasesFromWizardInputs('', '', '')).toBeUndefined();
      expect(buildIdtAliasesFromWizardInputs()).toBeUndefined();
    });

    it('collapses matching 5/i/3 indicator forms to base only', () => {
      expect(
        buildIdtAliasesFromWizardInputs('5Sp18', 'iSp18', '3Sp18'),
      ).toEqual({ base: 'Sp18' });
      expect(
        buildIdtAliasesFromWizardInputs('/5Sp18/', '/iSp18/', '/3Sp18/'),
      ).toEqual({ base: 'Sp18' });
    });

    it('stores modifications for a two-position input', () => {
      expect(buildIdtAliasesFromWizardInputs('5Phos', '', '3Phos')).toEqual({
        base: 'Phos',
        modifications: {
          endpoint5: '/5Phos/',
          endpoint3: '/3Phos/',
        },
      });
    });

    it('does not collapse when the common base differs', () => {
      expect(
        buildIdtAliasesFromWizardInputs('52AmPr', 'i2AmPr', '32AmPu'),
      ).toEqual({
        base: '2AmPr',
        modifications: {
          endpoint5: '/52AmPr/',
          internal: '/i2AmPr/',
          endpoint3: '/32AmPu/',
        },
      });
    });

    it('derives base from a single 5′ position', () => {
      expect(buildIdtAliasesFromWizardInputs('5AmMC12')).toEqual({
        base: 'AmMC12',
        modifications: {
          endpoint5: '/5AmMC12/',
        },
      });
    });

    it('force-adds terminal slashes for slashless input', () => {
      expect(buildIdtAliasesFromWizardInputs('5DigN', 'iDigN')).toEqual({
        base: 'DigN',
        modifications: {
          endpoint5: '/5DigN/',
          internal: '/iDigN/',
        },
      });
    });

    it('does not collapse rA/rA/rA (no position indicators)', () => {
      expect(buildIdtAliasesFromWizardInputs('rA', 'rA', 'rA')).toEqual({
        base: 'rA',
        modifications: {
          endpoint5: '/rA/',
          internal: '/rA/',
          endpoint3: '/rA/',
        },
      });
    });

    it('does not collapse bare position indicators to an empty base', () => {
      expect(buildIdtAliasesFromWizardInputs('5', 'i', '3')).toEqual({
        base: '5',
        modifications: {
          endpoint5: '/5/',
          internal: '/i/',
          endpoint3: '/3/',
        },
      });
    });

    it('keeps a bare 5′ indicator as a non-empty base', () => {
      expect(buildIdtAliasesFromWizardInputs('5')).toEqual({
        base: '5',
        modifications: {
          endpoint5: '/5/',
        },
      });
    });
  });

  describe('expandIdtAliasesToWizardInputs', () => {
    it('returns empty strings when idtAliases or base is absent', () => {
      expect(expandIdtAliasesToWizardInputs()).toEqual({
        idtAlias5: '',
        idtAliasInternal: '',
        idtAlias3: '',
      });
      expect(expandIdtAliasesToWizardInputs(undefined)).toEqual({
        idtAlias5: '',
        idtAliasInternal: '',
        idtAlias3: '',
      });
    });

    it('re-expands a collapsed base into 5/i/3 indicator forms', () => {
      expect(expandIdtAliasesToWizardInputs({ base: 'Sp18' })).toEqual({
        idtAlias5: '5Sp18',
        idtAliasInternal: 'iSp18',
        idtAlias3: '3Sp18',
      });
    });

    it('strips terminal slashes from partial modifications', () => {
      expect(
        expandIdtAliasesToWizardInputs({
          base: 'Phos',
          modifications: {
            endpoint5: '/5Phos/',
            endpoint3: '/3Phos/',
          },
        }),
      ).toEqual({
        idtAlias5: '5Phos',
        idtAliasInternal: '',
        idtAlias3: '3Phos',
      });
    });

    it('strips terminal slashes from all three modifications', () => {
      expect(
        expandIdtAliasesToWizardInputs({
          base: 'Cy3',
          modifications: {
            endpoint5: '/5Cy3/',
            internal: '/iCy3/',
            endpoint3: '/3Cy3Sp/',
          },
        }),
      ).toEqual({
        idtAlias5: '5Cy3',
        idtAliasInternal: 'iCy3',
        idtAlias3: '3Cy3Sp',
      });
    });

    it.each([
      {
        label: 'collapsed base',
        stored: { base: 'Sp18' },
      },
      {
        label: 'partial modifications',
        stored: {
          base: 'Phos',
          modifications: {
            endpoint5: '/5Phos/',
            endpoint3: '/3Phos/',
          },
        },
      },
      {
        label: 'all three modifications',
        stored: {
          base: 'Cy3',
          modifications: {
            endpoint5: '/5Cy3/',
            internal: '/iCy3/',
            endpoint3: '/3Cy3Sp/',
          },
        },
      },
    ])('round-trips expand → build for $label', ({ stored }) => {
      const expanded = expandIdtAliasesToWizardInputs(stored);
      expect(
        buildIdtAliasesFromWizardInputs(
          expanded.idtAlias5,
          expanded.idtAliasInternal,
          expanded.idtAlias3,
        ),
      ).toEqual(stored);
    });
  });

  describe('getDisallowedModificationTypes', () => {
    it.each(DISALLOWED_MONOMER_MODIFICATION_TYPES)(
      'flags the disallowed modification type "%s"',
      (modificationType) => {
        expect(getDisallowedModificationTypes([modificationType])).toEqual([
          modificationType,
        ]);
      },
    );

    it('returns an empty array for allowed modification types', () => {
      expect(
        getDisallowedModificationTypes([
          'Natural amino acid',
          'Phosphorylation',
        ]),
      ).toEqual([]);
    });

    it('returns only the disallowed types from a mixed list', () => {
      expect(
        getDisallowedModificationTypes(['Natural amino acid', 'Unknown base']),
      ).toEqual(['Unknown base']);
    });

    it('returns an empty array when modification types are missing or empty', () => {
      expect(getDisallowedModificationTypes()).toEqual([]);
      expect(getDisallowedModificationTypes([])).toEqual([]);
    });

    it('returns an empty array for malformed (non-array) modification types', () => {
      // The value comes from parsed, untrusted library JSON, so it may not be an
      // array at runtime (e.g. a bare string). The guard must return an empty
      // result rather than throwing a TypeError.
      expect(
        getDisallowedModificationTypes('Unknown base' as unknown as string[]),
      ).toEqual([]);
      expect(
        getDisallowedModificationTypes(null as unknown as string[]),
      ).toEqual([]);
    });
  });

  describe('isValidModificationTypes', () => {
    it('returns true when modificationTypes is undefined (optional field)', () => {
      expect(isValidModificationTypes(undefined)).toBe(true);
    });

    it('returns true when modificationTypes is not an array', () => {
      expect(
        isValidModificationTypes('not an array' as unknown as string[]),
      ).toBe(true);
    });

    it('returns true for valid modification types with spaces', () => {
      expect(isValidModificationTypes(['Natural amino acid'])).toBe(true);
      expect(isValidModificationTypes(['Type 1', 'Type 2 with spaces'])).toBe(
        true,
      );
    });

    it('returns true for non-empty modification types', () => {
      expect(isValidModificationTypes(['Phosphorylation'])).toBe(true);
      expect(isValidModificationTypes(['A', 'B', 'C'])).toBe(true);
    });

    it('returns true for empty array', () => {
      expect(isValidModificationTypes([])).toBe(true);
    });

    it('returns false for modification types containing only whitespace', () => {
      expect(isValidModificationTypes([' '])).toBe(false);
      expect(isValidModificationTypes(['  ', '   '])).toBe(false);
    });

    it('returns false for modification types containing only formatting characters', () => {
      expect(isValidModificationTypes(['\t'])).toBe(false);
      expect(isValidModificationTypes(['\n'])).toBe(false);
      expect(isValidModificationTypes(['\r'])).toBe(false);
      expect(isValidModificationTypes(['\t', '\n', '\r'])).toBe(false);
    });

    it('returns false for modification types containing only whitespace and formatting characters', () => {
      expect(isValidModificationTypes(['\t '])).toBe(false);
      expect(isValidModificationTypes([' \t \n '])).toBe(false);
      expect(isValidModificationTypes(['\t ', '  \n  '])).toBe(false);
    });

    it('returns true for modification types with semicolon (valid non-whitespace character)', () => {
      expect(isValidModificationTypes([';'])).toBe(true);
      expect(isValidModificationTypes(['\t', ' ', ';'])).toBe(true);
    });

    it('returns true when modificationTypes contains valid characters with whitespace', () => {
      // Semicolon is a valid non-whitespace character, even with surrounding whitespace
      expect(isValidModificationTypes(['\t ;'])).toBe(true);
      expect(isValidModificationTypes(['  valid  '])).toBe(true);
    });

    it('returns false when backend parses semicolon-delimited empty values', () => {
      // If backend parses "\t ;" as array with empty elements (e.g., ['\t ', ''])
      expect(isValidModificationTypes(['\t ', ''])).toBe(false);
      expect(isValidModificationTypes(['', ''])).toBe(false);
      expect(isValidModificationTypes(['', '\t', ''])).toBe(false);
    });

    it('returns false when total length exceeds max length', () => {
      const longValue = 'A'.repeat(MODIFICATION_TYPES_MAX_LENGTH + 1);
      expect(isValidModificationTypes([longValue])).toBe(false);
    });

    it('returns true when total length is at max length', () => {
      const maxLengthValue = 'A'.repeat(MODIFICATION_TYPES_MAX_LENGTH);
      expect(isValidModificationTypes([maxLengthValue])).toBe(true);
    });

    it('returns false when sum of multiple elements exceeds max length', () => {
      // Each element is 101 chars, total 202 > 200
      const value1 = 'A'.repeat(101);
      const value2 = 'B'.repeat(101);
      expect(isValidModificationTypes([value1, value2])).toBe(false);
    });

    it('returns true when sum of multiple elements is within max length', () => {
      // Each element is 100 chars, total 200 = 200
      const value1 = 'A'.repeat(100);
      const value2 = 'B'.repeat(100);
      expect(isValidModificationTypes([value1, value2])).toBe(true);
    });

    it('returns true for modification types with semicolons and special characters', () => {
      expect(isValidModificationTypes(['Type;1', 'Type-2'])).toBe(true);
    });
  });
});
