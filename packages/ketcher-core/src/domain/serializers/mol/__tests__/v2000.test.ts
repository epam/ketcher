import { AtomList, Bond, Vec2 } from 'domain/entities';
import { basic, reaction, rgroups } from './fixtures';

import molParsers from '../v2000';
import utils from '../utils';

const createCountsLine = (
  atomsCount = 0,
  bondsCount = 0,
  atomListsCount = 0
): string[] => {
  const atoms = String(atomsCount).padStart(3, ' ');
  const bonds = String(bondsCount).padStart(3, ' ');
  const atomLists = String(atomListsCount).padStart(3, ' ');

  return [
    atoms,
    bonds,
    atomLists,
    '   ',
    '  1',
    '  0',
    '   ',
    '   ',
    '   ',
    '   ',
    '999',
    ' V2000',
  ];
};

describe('parseCTabV2000', () => {
  const basicCtabLines = basic.split('\n').slice(3);
  const basicCountsSplit = [
    ' 76',
    ' 71',
    '  0',
    '   ',
    '  1',
    '  0',
    '   ',
    '   ',
    '   ',
    '   ',
    '999',
    ' V2000',
  ];

  describe('parseAtomLine', () => {
    it('should parse xyz params', () => {
      const atomLines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.0000    3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
      ];

      const struct = molParsers.parseCTabV2000(atomLines, createCountsLine(2));
      expect(struct.atoms.get(0)!.pp).toStrictEqual(
        new Vec2({ x: 14, y: 3, z: 0 })
      );
      expect(struct.atoms.get(1)!.pp).toStrictEqual(
        new Vec2({ x: 14, y: -3, z: 0 })
      );
    });

    it('should not parse incorrect xyz atom line', () => {
      // correct pattern is xxxxx.xxxxyyyyy.yyyyzzzzz.zzzz
      const incorrectAtomLine = [
        '  14.0000 -3.35000 0.123456 S   0  0  0  0  0  0  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(
        incorrectAtomLine,
        createCountsLine(1)
      );
      expect(struct.atoms.get(0)!.pp).not.toEqual({ x: 14, y: 3, z: 0 });
    });

    it('should parse correctly two-digit integers', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.pp).toStrictEqual(
        new Vec2({ x: 14.1234, y: 23.5678, z: 10.9876 })
      );
    });

    it('should parse correctly label', () => {
      const atomLines = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 Cl  0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 Gen  0  0  0  0  0  0  0  0  0  0  0  0',
      ];

      const struct = molParsers.parseCTabV2000(atomLines, createCountsLine(3));

      expect(struct.atoms.get(0)!.label).toBe('S');
      expect(struct.atoms.get(1)!.label).toBe('Cl');
      expect(struct.atoms.get(2)!.label).toBe('Gen');
    });

    it('should not parse label that is not match pattern', () => {
      const incorrectAtomLines = [
        '   14.1234  -23.5678   10.9876Cl    0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876   Na  0  0  0  0  0  0  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(
        incorrectAtomLines,
        createCountsLine(2)
      );
      expect(struct.atoms.get(0)!.label).not.toBe('Cl');
      expect(struct.atoms.get(1)!).not.toBe('Na');
    });

    it('should trim label', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.label).not.toBe('S  ');
      expect(struct.atoms.get(0)!.label).toBe('S');
    });

    it('should parse charge correctly', () => {
      const atomLines = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  1  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  2  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  3  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  4  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  5  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  6  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  7  0  0  0  0  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLines, createCountsLine(8));

      expect(struct.atoms.get(0)!.charge).toBe(0);
      expect(struct.atoms.get(1)!.charge).toBe(+3);
      expect(struct.atoms.get(2)!.charge).toBe(+2);
      expect(struct.atoms.get(3)!.charge).toBe(+1);
      expect(struct.atoms.get(4)!.charge).toBe(0);
      expect(struct.atoms.get(5)!.charge).toBe(-1);
      expect(struct.atoms.get(6)!.charge).toBe(-2);
      expect(struct.atoms.get(7)!.charge).toBe(-3);
    });

    it('should parse hCount correctly', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  1  0  0  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.hCount).toBe(1);
    });

    it('should parse explicitValence', () => {
      const atomLines = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  7  0  0  0  0  0  0',
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0 15  0  0  0  0  0  0',
      ];

      const struct = molParsers.parseCTabV2000(atomLines, createCountsLine(3));

      expect(struct.atoms.get(0)!.explicitValence).toBe(-1);
      expect(struct.atoms.get(1)!.explicitValence).toBe(7);
      expect(struct.atoms.get(2)!.explicitValence).toBe(0);
    });

    it('should not parse correctly explicitValence that not match pattern', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  15  0  0  0  0  0  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.explicitValence).not.toBe(0);
    });

    it('should parse correctly aam', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  1  0  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.aam).toBe(1);
    });

    it('should parse correctly invRet', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  1  0',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.invRet).toBe(1);
    });

    it('should parse correctly exactChangeFlag', () => {
      const atomLine = [
        '   14.1234  -23.5678   10.9876 S   0  0  0  0  0  0  0  0  0  0  0  1',
      ];
      const struct = molParsers.parseCTabV2000(atomLine, createCountsLine(1));
      expect(struct.atoms.get(0)!.exactChangeFlag).toBe(1);
    });
  });

  describe('parseBondLine', () => {
    it('should parse atom numbers correctly', () => {
      const bondLines = [
        '1  2  2  0     0  0',
        '3339992  0     0  0',
        '22 44 0     0  0',
      ];
      const struct = molParsers.parseCTabV2000(
        bondLines,
        createCountsLine(0, 3)
      );

      expect(struct.bonds.get(0)!.begin).toBe(0);
      expect(struct.bonds.get(0)!.end).toBe(1);
      expect(struct.bonds.get(1)!.begin).toBe(332);
      expect(struct.bonds.get(1)!.end).toBe(998);
      expect(struct.bonds.get(2)!.begin).toBe(21);
      expect(struct.bonds.get(2)!.end).toBe(43);
    });

    it('should not parse correctly atom numbers that do not match pattern', () => {
      // pattern is 111222tttsssxxxrrrccc
      // where 111 - first atom
      // 222 - second atom
      const bondLine = ['123  21  2  0     0  0'];
      const struct = molParsers.parseCTabV2000(
        bondLine,
        createCountsLine(0, 1)
      );

      expect(struct.bonds.get(0)!.end).not.toBe(20);
    });

    it('should parse correctly bond type', () => {
      const bondLines = [
        '1  2  1  0     0  0',
        '1  2  2  0     0  0',
        '1  2  3  0     0  0',
        '1  2  4  0     0  0',
        '1  2  5  0     0  0',
        '1  2  6  0     0  0',
        '1  2  7  0     0  0',
        '1  2  8  0     0  0',
        '1  2  9  0     0  0',
        '1  2  10  0     0  0',
      ];

      const struct = molParsers.parseCTabV2000(
        bondLines,
        createCountsLine(0, 10)
      );

      expect(struct.bonds.get(0)!.type).toBe(Bond.PATTERN.TYPE.SINGLE);
      expect(struct.bonds.get(1)!.type).toBe(Bond.PATTERN.TYPE.DOUBLE);
      expect(struct.bonds.get(2)!.type).toBe(Bond.PATTERN.TYPE.TRIPLE);
      expect(struct.bonds.get(3)!.type).toBe(Bond.PATTERN.TYPE.AROMATIC);
      expect(struct.bonds.get(4)!.type).toBe(
        Bond.PATTERN.TYPE.SINGLE_OR_DOUBLE
      );
      expect(struct.bonds.get(5)!.type).toBe(
        Bond.PATTERN.TYPE.SINGLE_OR_AROMATIC
      );
      expect(struct.bonds.get(6)!.type).toBe(
        Bond.PATTERN.TYPE.DOUBLE_OR_AROMATIC
      );
      expect(struct.bonds.get(7)!.type).toBe(Bond.PATTERN.TYPE.ANY);
      expect(struct.bonds.get(8)!.type).toBe(Bond.PATTERN.TYPE.DATIVE);
      expect(struct.bonds.get(9)!.type).toBe(Bond.PATTERN.TYPE.HYDROGEN);
    });

    it('should parse correctly stereo', () => {
      const bondLines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '1  2  1  0     0  0',
        '1  2  1  1     0  0',
        '1  2  1  4     0  0',
        '1  2  1  6     0  0',
        '1  2  1  3     0  0',
      ];

      const struct = molParsers.parseCTabV2000(
        bondLines,
        createCountsLine(2, 5)
      );

      expect(struct.bonds.get(0)!.stereo).toBe(Bond.PATTERN.STEREO.NONE);
      expect(struct.bonds.get(1)!.stereo).toBe(Bond.PATTERN.STEREO.UP);
      expect(struct.bonds.get(2)!.stereo).toBe(Bond.PATTERN.STEREO.EITHER);
      expect(struct.bonds.get(3)!.stereo).toBe(Bond.PATTERN.STEREO.DOWN);
      expect(struct.bonds.get(4)!.stereo).toBe(Bond.PATTERN.STEREO.CIS_TRANS);
    });

    it('should parse xxx', () => {
      const bondLine = ['1  2  1  0     0  0'];
      const struct = molParsers.parseCTabV2000(
        bondLine,
        createCountsLine(0, 1)
      );
      expect(struct.bonds.get(0)!.xxx).toBe('   ');
    });

    it('should parse topology correctly', () => {
      const bondLines = [
        '1  2  1  0     0  0',
        '1  2  1  0     1  0',
        '1  2  1  0     2  0',
      ];

      const struct = molParsers.parseCTabV2000(
        bondLines,
        createCountsLine(0, 3)
      );

      expect(struct.bonds.get(0)!.topology).toBe(Bond.PATTERN.TOPOLOGY.EITHER);
      expect(struct.bonds.get(1)!.topology).toBe(Bond.PATTERN.TOPOLOGY.RING);
      expect(struct.bonds.get(2)!.topology).toBe(Bond.PATTERN.TOPOLOGY.CHAIN);
    });

    it('should parse reactingCenterStatus correctly', () => {
      const bondLine = ['1  2  1  0     0  1'];
      const struct = molParsers.parseCTabV2000(
        bondLine,
        createCountsLine(0, 1)
      );
      expect(struct.bonds.get(0)!.reactingCenterStatus).toBe(1);
    });
  });

  describe('parseAtomListLine', () => {
    it('should parse atom number correctly', () => {
      // pattern: aaa kSSSSn 111 222 333 444 555
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '1   T    5 111 222 333 444 555',
        '2   F    5 111 222 333 444 555',
      ];

      const struct = molParsers.parseCTabV2000(
        lines,
        createCountsLine(2, 0, 2)
      );

      expect(struct.atoms.get(0)!.atomList instanceof AtomList).toBe(true);
      expect(struct.atoms.get(0)!.atomList).not.toBe(null);
      expect(struct.atoms.get(1)!.atomList).not.toBe(null);
    });

    it('should not parse atom number that does not match pattern', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   3   T    5 111 222 333 444 555',
      ];

      expect(() =>
        molParsers.parseCTabV2000(lines, createCountsLine(3, 0, 1))
      ).toThrow();
    });

    it('should parse list type correctly', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '1   T    5 111 222 333 444 555',
        '2   F    5 111 222 333 444 555',
      ];

      const struct = molParsers.parseCTabV2000(
        lines,
        createCountsLine(2, 0, 2)
      );

      expect(struct.atoms.get(0)!.atomList!.notList).toBe(true);
      expect(struct.atoms.get(1)!.atomList!.notList).toBe(false);
    });

    it('should parse list count and atomic numbers correctly', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '1   T    4 111 222 333 444',
        '2   F    2 111 222',
      ];

      const struct = molParsers.parseCTabV2000(
        lines,
        createCountsLine(2, 0, 2)
      );

      expect(struct.atoms.get(0)!.atomList!.ids).toHaveLength(4);
      expect(struct.atoms.get(0)!.atomList!.ids).toEqual([111, 222, 333, 444]);
      expect(struct.atoms.get(1)!.atomList!.ids).toHaveLength(2);
      expect(struct.atoms.get(1)!.atomList!.ids).toEqual([111, 222]);
    });
  });

  describe('parsePropertyLines', () => {
    it('should parse atom alias', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'A    1',
        'ACH',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(1));
      expect(struct.atoms.get(0)!.alias).toBe('ACH');
    });

    it('should parse charge', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  CHG  2   1  -3   2   2',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.charge).toBe(-3);
      expect(struct.atoms.get(1)!.charge).toBe(2);
    });

    it('should parse radical', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  RAD  2   1   3   2   1',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.radical).toBe(3);
      expect(struct.atoms.get(1)!.radical).toBe(1);
    });

    it('should parse isotope', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  ISO  2   1  13   2  11',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.isotope).toBe(13);
      expect(struct.atoms.get(1)!.isotope).toBe(11);
    });

    it('should parse ringBondCount', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  RBC  2   1  -2   2   4',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.ringBondCount).toBe(-2);
      expect(struct.atoms.get(1)!.ringBondCount).toBe(4);
    });

    it('should parse substitutionCount', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  SUB  2   1  -2   2   6',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.substitutionCount).toBe(-2);
      expect(struct.atoms.get(1)!.substitutionCount).toBe(6);
    });

    it('should parse unsaturatedAtom', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  UNS  2   1   1   2   0',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.unsaturatedAtom).toBe(1);
      expect(struct.atoms.get(1)!.unsaturatedAtom).toBe(0);
    });

    it('should parse rgroup props', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   16.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   17.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  RGP  4   1   2   2   1   3   3   4   1',
        'M  LOG  1   1   0   0   1',
        'M  LOG  1   2   3   0   >0',
        'M  LOG  1   3   0   1   >0',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(4));

      expect(struct.atoms.get(0)!.rglabel).toBe(2);
      expect(struct.atoms.get(1)!.rglabel).toBe(1);
      expect(struct.atoms.get(2)!.rglabel).toBe(4);
      expect(struct.atoms.get(3)!.rglabel).toBe(1);

      expect(struct.rgroups.get(1)!.range).toBe('1');
      expect(struct.rgroups.get(2)!.ifthen).toBe(3);
      expect(struct.rgroups.get(3)!.resth).toBe(true);
    });

    it('should parse attachment point', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  APO  2   1   1   2   2',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.attpnt).toBe(1);
      expect(struct.atoms.get(1)!.attpnt).toBe(2);
    });

    it('should parse atom list', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        'M  ALS   1  3 F Sg  Bh  Pr ',
        'M  ALS   2  3 T Sg  Bh  Pr ',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(2));

      expect(struct.atoms.get(0)!.label).toBe('L#');
      expect(struct.atoms.get(0)!.atomList!.notList).toBe(false);
      expect(struct.atoms.get(0)!.atomList!.ids).toEqual([106, 107, 59]);
      expect(struct.atoms.get(1)!.atomList!.notList).toBe(true);
    });

    it('should parse sGroup props', () => {
      const lines = [
        '   14.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   15.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   16.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '   17.0000   -3.0000    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
        '1  2  1  0     0  0',
        'M  STY  2   1 GEN   2 SRU',
        'M  SST  2   1 ALT   2 RAN',
        'M  SLB  2   1   1   2   2',
        'M  SCN  2   1  EU   2  HT',
        'M  SAL  1   2   1   2',
        'M  SBL   1  1   1',
        'M  SPA   1  2   3   4',
        'M  SAL  2   2   3   4',
        'M  SPL  1   1   2',
        'M  SMT   1  3',
        'M  SDT   1 test30characterdescaaaaaaaaaaa F',
        'M  SDD   2     1.0000    5.0000    AAU',
        'M  SCD   1 testData',
        'M  SED   2 absolute',
      ];

      const struct = molParsers.parseCTabV2000(lines, createCountsLine(4, 1));

      const firstSGroup = struct.sgroups.get(0)!;
      const secondSGroup = struct.sgroups.get(1)!;

      expect(firstSGroup.type).toBe('GEN');
      expect(secondSGroup.type).toBe('SRU');
      expect(firstSGroup.data.subtype).toBe('ALT');
      expect(secondSGroup.data.subtype).toBe('RAN');
      expect(firstSGroup.data.label).toBe(1);
      expect(secondSGroup.data.label).toBe(2);
      expect((firstSGroup as any).parent).toBe(2);
      expect(firstSGroup.data.connectivity).toBe('EU');
      expect(secondSGroup.data.connectivity).toBe('ht');
      expect(firstSGroup.data.subscript).toBe('3');
      expect(firstSGroup.atoms).toEqual([0, 1]);
      expect(firstSGroup.bonds).toEqual([0]);
      expect(firstSGroup.patoms).toEqual([2, 3]);
      expect(firstSGroup.data.fieldName).toBe('test30characterdescaaaaaaaaaaa');
      expect(firstSGroup.data.fieldType).toBe('F');
      expect(secondSGroup.pp).toEqual({ x: 1, y: -5, z: 0 });
      expect(secondSGroup.data.attached).toBe(true);
      expect(secondSGroup.data.absolute).toBe(true);
      expect(secondSGroup.data.showUnits).toBe(true);
      expect(firstSGroup.data.fieldValue).toBe('testData');
      expect(secondSGroup.data.fieldValue).toBe('absolute');
    });
  });

  it('should add exact number of elements to Struct', () => {
    const struct = molParsers.parseCTabV2000(basicCtabLines, basicCountsSplit);
    expect(struct.atoms.size).toBe(76);
    expect(struct.bonds.size).toBe(71);
  });

  it('should apply props to atoms and bonds', () => {
    const struct = molParsers.parseCTabV2000(basicCtabLines, basicCountsSplit);
    expect(struct.bonds.get(4)!.stereo).toBe(4);
    expect(struct.atoms.get(5)!.exactChangeFlag).toBe(1);
    expect(struct.atoms.get(6)!.charge).toBe(-3);
  });

  it('should add stereoLabel to atom', () => {
    const struct = molParsers.parseCTabV2000(basicCtabLines, basicCountsSplit);
    expect(struct.atoms.get(3)!.stereoLabel).toBe('abs');
  });

  it('should add atoms to DAT sgroup without atoms in generic sgroup', () => {
    const sgroupInitLine = [
      'M  STY  2   1 GEN   2 DAT',
      'M  SAL   1  3  11  12  10',
      'M  SPL  1   2   1',
    ];

    const struct = molParsers.parseCTabV2000(
      sgroupInitLine,
      createCountsLine()
    );
    expect(struct.sgroups.get(1)!.atoms).toEqual(struct.sgroups.get(0)!.atoms);
    expect(struct.sgroups.get(1)!.atoms).not.toBe(struct.sgroups.get(0)!.atoms);
  });

  it('should remove sgroup without atoms and parents', () => {
    const sgroupInitLine = [
      'M  STY  2   1 GEN   2 DAT',
      'M  SAL   1  3  11  12  10',
    ];

    const struct = molParsers.parseCTabV2000(
      sgroupInitLine,
      createCountsLine()
    );
    expect(struct.sgroups.size).toBe(1);
  });

  it('should add rlogic to struct', () => {
    const rgpPropLine = [
      '   14.2771   -3.2353    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
      '   15.2771   -3.2353    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0',
      'M  RGP  2   1   1   2   2',
      'M  LOG  1   1   0   0   1',
      'M  LOG  1   2   3   0   >0',
    ];

    const struct = molParsers.parseCTabV2000(rgpPropLine, createCountsLine(2));
    expect(struct.rgroups.size).toBe(2);
  });
});

describe('parseRxn2000', () => {
  it('should correctly parse 3 mol structures', () => {
    const lines = reaction.split('\n');
    const shouldReactionRelayout = false;
    const spy = jest.spyOn(utils, 'rxnMerge');
    molParsers.parseRxn2000(lines, shouldReactionRelayout);
    expect(spy.mock.calls[0][0]).toHaveLength(3);
    expect(spy.mock.calls[0][1]).toBe(2);
    expect(spy.mock.calls[0][2]).toBe(1);
    expect(spy.mock.calls[0][3]).toBe(0);
    expect(spy.mock.calls[0][0][0].atoms.size).toBe(6);
    expect(spy.mock.calls[0][0][0].bonds.size).toBe(6);
    expect(spy.mock.calls[0][0][1].atoms.size).toBe(43);
    expect(spy.mock.calls[0][0][1].bonds.size).toBe(42);
    expect(spy.mock.calls[0][0][2].atoms.size).toBe(19);
    expect(spy.mock.calls[0][0][2].bonds.size).toBe(18);
  });
});

describe('parseRg2000', () => {
  it('should throw if 8th line is not $CTAB', () => {
    const throwLines = [
      '$MDL  REV  1',
      '$MOL',
      '$HDR',
      '',
      '',
      '',
      '$END HDR',
      '$CTA',
    ];
    expect(() => molParsers.parseRg2000(throwLines)).toThrow();
  });

  it('should throw if there is no end ctab mark', () => {
    const throwLines = [
      '$MDL  REV  1',
      '$MOL',
      '$HDR',
      '',
      '',
      '',
      '$END HDR',
      '$CTAB',
      '  2  0  0     0  0            999 V2000',
      '   -3.4608   -4.5124    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0',
      '   -2.5948   -4.0124    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
    ];
    expect(() => molParsers.parseRg2000(throwLines)).toThrow();
  });

  it('should throw if there is no $RGP mark after first mol', () => {
    const throwLines = [
      '$MDL  REV  1',
      '$MOL',
      '$HDR',
      '',
      '',
      '',
      '$END HDR',
      '$CTAB',
      '  2  0  0     0  0            999 V2000',
      '   -3.4608   -4.5124    0.0000 R#  0  0  0  0  0  0  0  0  0  0  0  0',
      '   -2.5948   -4.0124    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0',
      '$END CTAB',
    ];
    expect(() => molParsers.parseRg2000(throwLines)).toThrow();
  });

  it('should parse correctly rg ext', () => {
    const lines = rgroups.split('\n');
    const spy = jest.spyOn(utils, 'rgMerge');
    molParsers.parseRg2000(lines);
    expect(spy.mock.calls[0][0].atoms.size).toBe(14);
    expect(spy.mock.calls[0][0].bonds.size).toBe(14);
    expect(Object.keys(spy.mock.calls[0][1])).toHaveLength(3);
  });
});
