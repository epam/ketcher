import {
  DISALLOWED_MONOMER_MODIFICATION_TYPES,
  buildIdtAliasesFromWizardInputs,
  getDisallowedModificationTypes,
  HELM_ALIAS_MAX_LENGTH,
  isValidHelmAliasLength,
  isValidIdtAliasFormat,
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
});
