import {
  calculateValenceMinusHydrogen,
  calculateValenceResult,
  resolveAromaticAtomValence,
} from 'domain/entities/atomValence';
import { Atom } from 'domain/entities/atom';
import { Atom as CoreAtom } from 'domain/entities/CoreAtom';
import { BondType, type Bond as CoreBond } from 'domain/entities/CoreBond';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel } from 'domain/constants';

const createContext = (
  label: string,
  connectionCount: number,
  charge = 0,
  radicalCount = 0,
) => ({
  label,
  charge,
  connectionCount,
  radicalCount,
  absCharge: Math.abs(charge),
});

describe('calculateValenceResult', () => {
  it('should return zero hydrogens for carbon with four connections', () => {
    expect(calculateValenceResult(4, createContext('C', 4))).toEqual({
      valence: 4,
      hydrogenCount: 0,
    });
  });

  it('should return negative hydrogen count for carbon with five connections', () => {
    expect(calculateValenceResult(4, createContext('C', 5))).toEqual({
      valence: 4,
      hydrogenCount: -1,
    });
  });

  it('should promote nitrogen to valence 5 when three connections are exceeded', () => {
    expect(calculateValenceResult(5, createContext('N', 4))).toEqual({
      valence: 5,
      hydrogenCount: 1,
    });
  });

  it('should return negative hydrogen count for neutral oxygen with three connections', () => {
    expect(calculateValenceResult(6, createContext('O', 3))).toEqual({
      valence: 2,
      hydrogenCount: -1,
    });
  });

  it('should allow three connections for positively charged oxygen', () => {
    expect(calculateValenceResult(6, createContext('O', 3, 1))).toEqual({
      valence: 3,
      hydrogenCount: 0,
    });
  });

  it('should return null for labels without a periodic group other than D/T', () => {
    expect(calculateValenceResult(undefined, createContext('Q', 1))).toBeNull();
    expect(calculateValenceResult(undefined, createContext('D', 0))).toEqual({
      valence: 1,
      hydrogenCount: 1,
    });
  });
});

describe('calculateValenceMinusHydrogen', () => {
  it('should not count charge for elements where it takes part in bonding', () => {
    expect(calculateValenceMinusHydrogen(5, createContext('N', 3, 1))).toBe(3);
    expect(calculateValenceMinusHydrogen(6, createContext('O', 2, 1))).toBe(2);
    expect(calculateValenceMinusHydrogen(3, createContext('B', 3, -1))).toBe(3);
  });

  it('should count charge for other elements', () => {
    expect(calculateValenceMinusHydrogen(4, createContext('C', 3, 1))).toBe(4);
  });
});

describe('resolveAromaticAtomValence', () => {
  it('should mark aromatic neutral carbon with four or more connections as bad valence', () => {
    expect(resolveAromaticAtomValence(createContext('C', 4))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: true,
    });
    expect(resolveAromaticAtomValence(createContext('C', 5))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: true,
    });
  });

  it('should resolve aromatic neutral carbon with two or three connections without warning', () => {
    expect(resolveAromaticAtomValence(createContext('C', 2))).toEqual({
      kind: 'calculated',
      hydrogenCount: 1,
      badValence: false,
    });
    expect(resolveAromaticAtomValence(createContext('C', 3))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: false,
    });
  });

  it('should fall back to standard tables for aromatic carbon with indeterminate connections', () => {
    expect(resolveAromaticAtomValence(createContext('C', -1))).toEqual({
      kind: 'standard',
    });
  });

  it('should suppress warnings for known aromatic heteroatom patterns', () => {
    expect(resolveAromaticAtomValence(createContext('O', 2))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: false,
    });
    expect(resolveAromaticAtomValence(createContext('N', 3))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: false,
    });
    expect(resolveAromaticAtomValence(createContext('N', 3, 1))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: false,
    });
    expect(resolveAromaticAtomValence(createContext('S', 3))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: false,
    });
  });

  it('should suppress warnings for aromatic atoms without stored implicit hydrogens', () => {
    expect(resolveAromaticAtomValence(createContext('N', 4))).toEqual({
      kind: 'calculated',
      hydrogenCount: 0,
      badValence: false,
    });
  });

  it('should correct connectivity for aromatic atoms with stored implicit hydrogens', () => {
    expect(
      resolveAromaticAtomValence(createContext('N', 2), {
        currentImplicitHydrogenCount: 1,
        hasImplicitHydrogenFlag: false,
      }),
    ).toEqual({ kind: 'correctedConnectivity', connectionCount: 3 });
  });

  it('should use standard tables for aromatic atoms with the MRV implicit hydrogen flag', () => {
    expect(
      resolveAromaticAtomValence(createContext('N', 2), {
        currentImplicitHydrogenCount: 1,
        hasImplicitHydrogenFlag: true,
      }),
    ).toEqual({ kind: 'standard' });
  });
});

describe('Struct.calcImplicitHydrogen (micromolecules mode)', () => {
  const createStructWithCentralAtom = (
    label: string,
    bondsConfig: Array<number>,
  ) => {
    const struct = new Struct();
    const centralAtomId = struct.atoms.add(
      new Atom({ label, pp: new Vec2(0, 0) }),
    );

    bondsConfig.forEach((bondType, index) => {
      const neighborId = struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(index + 1, 0) }),
      );
      const bondId = struct.bonds.add(
        new Bond({ begin: centralAtomId, end: neighborId, type: bondType }),
      );
      struct.bondInitHalfBonds(bondId);
    });

    struct.initNeighbors();

    return { struct, centralAtomId };
  };

  it('should mark aromatic carbon with four connections as bad connection (#3890)', () => {
    const { struct, centralAtomId } = createStructWithCentralAtom('C', [
      Bond.PATTERN.TYPE.AROMATIC,
      Bond.PATTERN.TYPE.AROMATIC,
      Bond.PATTERN.TYPE.AROMATIC,
      Bond.PATTERN.TYPE.SINGLE,
    ]);

    struct.calcImplicitHydrogen(centralAtomId);

    expect(struct.atoms.get(centralAtomId)?.badConn).toBe(true);
  });

  it('should not mark benzene-like aromatic carbon as bad connection', () => {
    const { struct, centralAtomId } = createStructWithCentralAtom('C', [
      Bond.PATTERN.TYPE.AROMATIC,
      Bond.PATTERN.TYPE.AROMATIC,
    ]);

    struct.calcImplicitHydrogen(centralAtomId);

    const atom = struct.atoms.get(centralAtomId);
    expect(atom?.badConn).toBe(false);
    expect(atom?.implicitH).toBe(1);
  });

  it('should mark carbon with five single bonds as bad connection', () => {
    const { struct, centralAtomId } = createStructWithCentralAtom('C', [
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.TYPE.SINGLE,
      Bond.PATTERN.TYPE.SINGLE,
    ]);

    struct.calcImplicitHydrogen(centralAtomId);

    expect(struct.atoms.get(centralAtomId)?.badConn).toBe(true);
  });
});

describe('CoreAtom.calculateValence (macromolecules mode)', () => {
  const createCoreAtom = (
    label: AtomLabel,
    bondTypes: Array<BondType>,
    properties = {},
  ) => {
    const atom = new CoreAtom(
      new Vec2(0, 0),
      {} as BaseMonomer,
      0,
      label,
      properties,
    );

    bondTypes.forEach((type, index) => {
      atom.addBond({ id: index, type } as CoreBond);
    });

    return atom;
  };

  it('should mark aromatic carbon with four connections as bad valence (#3890)', () => {
    const atom = createCoreAtom(AtomLabel.C, [
      BondType.Aromatic,
      BondType.Aromatic,
      BondType.Aromatic,
      BondType.Single,
    ]);

    expect(atom.hasBadValence).toBe(true);
  });

  it('should not mark aromatic carbon with three connections as bad valence', () => {
    const atom = createCoreAtom(AtomLabel.C, [
      BondType.Aromatic,
      BondType.Aromatic,
      BondType.Single,
    ]);

    expect(atom.hasBadValence).toBe(false);
    expect(atom.calculateValence().hydrogenAmount).toBe(0);
  });

  it('should calculate one implicit hydrogen for benzene-like aromatic carbon', () => {
    const atom = createCoreAtom(AtomLabel.C, [
      BondType.Aromatic,
      BondType.Aromatic,
    ]);

    expect(atom.hasBadValence).toBe(false);
    expect(atom.calculateValence().hydrogenAmount).toBe(1);
  });

  it('should not mark aromatic heteroatoms as bad valence, same as micromolecules mode', () => {
    const atom = createCoreAtom(AtomLabel.O, [
      BondType.Aromatic,
      BondType.Aromatic,
      BondType.Single,
    ]);

    expect(atom.hasBadValence).toBe(false);
  });

  it('should mark carbon with five single bonds as bad valence', () => {
    const atom = createCoreAtom(AtomLabel.C, [
      BondType.Single,
      BondType.Single,
      BondType.Single,
      BondType.Single,
      BondType.Single,
    ]);

    expect(atom.hasBadValence).toBe(true);
  });

  it('should not count dative and hydrogen bonds as connections', () => {
    const atom = createCoreAtom(AtomLabel.C, [
      BondType.Single,
      BondType.Single,
      BondType.Single,
      BondType.Single,
      BondType.Dative,
      BondType.Hydrogen,
    ]);

    expect(atom.hasBadValence).toBe(false);
    expect(atom.calculateValence().hydrogenAmount).toBe(0);
  });

  it('should respect explicit valence when calculating hydrogens', () => {
    const overloadedAtom = createCoreAtom(
      AtomLabel.C,
      [BondType.Single, BondType.Single, BondType.Single, BondType.Double],
      { explicitValence: 4 },
    );
    const nitrogenWithRoom = createCoreAtom(
      AtomLabel.N,
      [BondType.Single, BondType.Single, BondType.Single],
      { explicitValence: 5 },
    );

    expect(overloadedAtom.calculateValence()).toEqual({
      valence: 4,
      hydrogenAmount: -1,
      badValence: true,
    });
    expect(nitrogenWithRoom.calculateValence()).toEqual({
      valence: 5,
      hydrogenAmount: 2,
      badValence: false,
    });
  });

  it('should allow four single bonds on positively charged nitrogen', () => {
    const atom = createCoreAtom(
      AtomLabel.N,
      [BondType.Single, BondType.Single, BondType.Single, BondType.Single],
      { charge: 1 },
    );

    expect(atom.hasBadValence).toBe(false);
    expect(atom.calculateValence().hydrogenAmount).toBe(0);
  });
});
