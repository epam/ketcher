import { calcDativeValence } from 'domain/entities/atomDativeValence';

const base = {
  charge: 0,
  radicalCount: 0,
  bondOrderSum: 0,
  donorCount: 0,
  acceptorCount: 0,
};

describe('calcDativeValence', () => {
  it.each(['D', 'T', 'R#', 'Xx'])(
    'returns null for %s, which has no valence data',
    (label) => {
      expect(calcDativeValence({ ...base, label })).toBeNull();
    },
  );

  describe('Example 1: nickel(2+) with no bonds', () => {
    const ni = { ...base, label: 'Ni', charge: 2 };

    it('has El = 8, Or = 9, n_donor = 4, n_acceptor = 5 and no implicit hydrogen', () => {
      expect(calcDativeValence(ni)).toEqual({
        eligibleElectrons: 8,
        eligibleOrbitals: 9,
        maxDonors: 4,
        maxAcceptors: 5,
        hasValenceError: false,
        implicitHydrogenCount: 0,
      });
    });

    it.each([
      [4, 0, false],
      [5, 0, true],
      [0, 5, false],
      [0, 6, true],
    ])(
      'with %i donors and %i acceptors, valence error is %s',
      (donorCount, acceptorCount, hasValenceError) => {
        expect(
          calcDativeValence({ ...ni, donorCount, acceptorCount })
            ?.hasValenceError,
        ).toBe(hasValenceError);
      },
    );

    it('cancels one donor against one acceptor per pair (req 3)', () => {
      expect(
        calcDativeValence({ ...ni, donorCount: 5, acceptorCount: 1 })
          ?.hasValenceError,
      ).toBe(false);
      expect(
        calcDativeValence({ ...ni, donorCount: 5, acceptorCount: 5 })
          ?.hasValenceError,
      ).toBe(false);
      expect(
        calcDativeValence({ ...ni, donorCount: 6, acceptorCount: 1 })
          ?.hasValenceError,
      ).toBe(true);
    });
  });

  describe('Example 2: carbon with three bonds and one radical', () => {
    const carbon = { ...base, label: 'C', bondOrderSum: 3, radicalCount: 1 };

    it('has El = 0 and Or = 0, so no dative capacity and no implicit hydrogen', () => {
      expect(calcDativeValence(carbon)).toEqual({
        eligibleElectrons: 0,
        eligibleOrbitals: 0,
        maxDonors: 0,
        maxAcceptors: 0,
        hasValenceError: false,
        implicitHydrogenCount: 0,
      });
    });

    it('raises a valence error for a single dative donor', () => {
      const result = calcDativeValence({ ...carbon, donorCount: 1 });
      expect(result?.hasValenceError).toBe(true);
      expect(result?.implicitHydrogenCount).toBe(0);
    });

    it('raises a valence error for a single dative acceptor', () => {
      const result = calcDativeValence({ ...carbon, acceptorCount: 1 });
      expect(result?.hasValenceError).toBe(true);
      expect(result?.implicitHydrogenCount).toBe(0);
    });
  });

  describe('Example 3: chlorine(3+) with one single bond', () => {
    const chlorine = { ...base, label: 'Cl', charge: 3, bondOrderSum: 1 };

    it('has El = 3, Or = 3, n_donor = 1 and n_acceptor = 1', () => {
      const result = calcDativeValence(chlorine);
      expect(result).toMatchObject({
        eligibleElectrons: 3,
        eligibleOrbitals: 3,
        maxDonors: 1,
        maxAcceptors: 1,
        hasValenceError: false,
      });
    });

    it('gives one implicit hydrogen as a donor of one dative bond', () => {
      expect(calcDativeValence({ ...chlorine, donorCount: 1 })).toMatchObject({
        hasValenceError: false,
        implicitHydrogenCount: 1,
      });
    });

    it('gives one implicit hydrogen as an acceptor of one dative bond', () => {
      expect(
        calcDativeValence({ ...chlorine, acceptorCount: 1 }),
      ).toMatchObject({ hasValenceError: false, implicitHydrogenCount: 1 });
    });

    it('cancels a donor and an acceptor against each other (req 3)', () => {
      expect(
        calcDativeValence({ ...chlorine, donorCount: 1, acceptorCount: 1 }),
      ).toMatchObject({ hasValenceError: false, implicitHydrogenCount: 3 });
    });

    it('raises a valence error for two dative donors', () => {
      expect(
        calcDativeValence({ ...chlorine, donorCount: 2 })?.hasValenceError,
      ).toBe(true);
    });
  });

  describe('Example 4: aromatic nitrogen after dearomatization (two bond orders)', () => {
    const nitrogen = { ...base, label: 'N', bondOrderSum: 2 };

    it('has El = 3, Or = 2, n_donor = 1 and n_acceptor = 0', () => {
      expect(calcDativeValence(nitrogen)).toMatchObject({
        eligibleElectrons: 3,
        eligibleOrbitals: 2,
        maxDonors: 1,
        maxAcceptors: 0,
      });
    });

    it('gives one implicit hydrogen as a donor of one dative bond', () => {
      expect(calcDativeValence({ ...nitrogen, donorCount: 1 })).toMatchObject({
        hasValenceError: false,
        implicitHydrogenCount: 1,
      });
    });

    it('raises a valence error for an acceptor', () => {
      expect(
        calcDativeValence({ ...nitrogen, acceptorCount: 1 })?.hasValenceError,
      ).toBe(true);
    });
  });

  describe('Example 5: praseodymium(1-) with four bonds and a diradical', () => {
    const praseodymium = {
      ...base,
      label: 'Pr',
      charge: -1,
      bondOrderSum: 4,
      radicalCount: 2,
    };

    it('has El = 0, Or = 10, no donor capacity and ten acceptor capacity', () => {
      expect(calcDativeValence(praseodymium)).toEqual({
        eligibleElectrons: 0,
        eligibleOrbitals: 10,
        maxDonors: 0,
        maxAcceptors: 10,
        hasValenceError: false,
        implicitHydrogenCount: 0,
      });
    });

    it('accepts ten acceptors and rejects eleven', () => {
      expect(
        calcDativeValence({ ...praseodymium, acceptorCount: 10 })
          ?.hasValenceError,
      ).toBe(false);
      expect(
        calcDativeValence({ ...praseodymium, acceptorCount: 11 })
          ?.hasValenceError,
      ).toBe(true);
    });

    it('raises a valence error for a donor', () => {
      expect(
        calcDativeValence({ ...praseodymium, donorCount: 1 })?.hasValenceError,
      ).toBe(true);
    });
  });

  describe('capacity limits (req 4 and req 5)', () => {
    it('forbids donors when floor(El / 2) exceeds Or', () => {
      expect(
        calcDativeValence({ ...base, label: 'F', bondOrderSum: 3 }),
      ).toMatchObject({
        eligibleElectrons: 4,
        eligibleOrbitals: 1,
        maxDonors: 0,
        maxAcceptors: 0,
      });
    });

    it('allows one donor for helium, whose El / 2 equals Or', () => {
      expect(calcDativeValence({ ...base, label: 'He' })).toMatchObject({
        maxDonors: 1,
        maxAcceptors: 0,
      });
    });
  });

  describe('implicit hydrogen (req 7 and req 8)', () => {
    it('equals El when El <= Or (carbon with no bonds)', () => {
      expect(
        calcDativeValence({ ...base, label: 'C', donorCount: 1 }),
      ).toMatchObject({ implicitHydrogenCount: 2 });
    });

    it('equals 2 * Or - El when Or < El < 2 * Or (fluorine with no bonds)', () => {
      expect(calcDativeValence({ ...base, label: 'F' })).toMatchObject({
        implicitHydrogenCount: 1,
      });
    });

    it('is zero when El >= 2 * Or (oxygen with two acceptors)', () => {
      expect(
        calcDativeValence({ ...base, label: 'O', acceptorCount: 2 }),
      ).toMatchObject({ hasValenceError: true, implicitHydrogenCount: 0 });
    });

    it('is zero for a label without implicit hydrogens, even when El <= Or', () => {
      expect(
        calcDativeValence({ ...base, label: 'Fe', donorCount: 1 }),
      ).toMatchObject({ implicitHydrogenCount: 0 });
    });
  });
});
