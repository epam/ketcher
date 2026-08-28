import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { CUSTOM_QUERY_MAX_LENGTH } from 'domain/constants/customQuery';
import { atomToStruct, bondToStruct } from '../fromKet/atomBondToStruct';
import { moleculeToKet } from '../toKet/moleculeToKet';

const OVER_LIMIT = CUSTOM_QUERY_MAX_LENGTH + 1;
const AT_LIMIT = CUSTOM_QUERY_MAX_LENGTH;

const baseAtomSource = (customQuery: string) => ({
  label: 'C',
  location: [0, 0, 0],
  queryProperties: { customQuery },
});

const baseBondSource = (customQuery: string) => ({
  atoms: [0, 1],
  customQuery,
});

describe('customQuery length validation', () => {
  describe('atomToStruct (load from .ket)', () => {
    it('throws when atom customQuery exceeds limit', () => {
      expect(() =>
        atomToStruct(baseAtomSource('A'.repeat(OVER_LIMIT))),
      ).toThrow(`Atom custom query exceeds the maximum allowed length`);
    });

    it('accepts atom customQuery exactly at the limit', () => {
      expect(() =>
        atomToStruct(baseAtomSource('A'.repeat(AT_LIMIT))),
      ).not.toThrow();
    });

    it('accepts atom customQuery below the limit', () => {
      expect(() => atomToStruct(baseAtomSource('[CH2]'))).not.toThrow();
    });

    it('returns a valid Atom when customQuery is within limit', () => {
      const result = atomToStruct(baseAtomSource('[CH2]'));
      expect(result).toBeInstanceOf(Atom);
      expect(result.queryProperties.customQuery).toBe('[CH2]');
    });
  });

  describe('bondToStruct (load from .ket)', () => {
    it('throws when bond customQuery exceeds limit', () => {
      expect(() =>
        bondToStruct(baseBondSource('A'.repeat(OVER_LIMIT))),
      ).toThrow(`Bond custom query exceeds the maximum allowed length`);
    });

    it('accepts bond customQuery exactly at the limit', () => {
      expect(() =>
        bondToStruct(baseBondSource('A'.repeat(AT_LIMIT))),
      ).not.toThrow();
    });

    it('accepts bond customQuery below the limit', () => {
      expect(() => bondToStruct(baseBondSource('-'))).not.toThrow();
    });

    it('returns a valid Bond when customQuery is within limit', () => {
      const result = bondToStruct(baseBondSource('-'));
      expect(result).toBeInstanceOf(Bond);
      expect(result.customQuery).toBe('-');
    });
  });

  describe('moleculeToKet (save to .ket)', () => {
    function makeStructWithAtomCustomQuery(customQuery: string): Struct {
      const struct = new Struct();
      const atom = new Atom({ label: 'C', queryProperties: { customQuery } });
      struct.atoms.add(atom);
      return struct;
    }

    function makeStructWithBondCustomQuery(customQuery: string): Struct {
      const struct = new Struct();
      const a1 = new Atom({ label: 'C' });
      const a2 = new Atom({ label: 'C' });
      const id1 = struct.atoms.add(a1);
      const id2 = struct.atoms.add(a2);
      const bond = new Bond({ type: 1, begin: id1, end: id2, customQuery });
      struct.bonds.add(bond);
      return struct;
    }

    it('throws when serializing atom with customQuery exceeding limit', () => {
      const struct = makeStructWithAtomCustomQuery('A'.repeat(OVER_LIMIT));
      expect(() => moleculeToKet(struct)).toThrow(
        `Atom custom query exceeds the maximum allowed length`,
      );
    });

    it('accepts atom customQuery exactly at the limit', () => {
      const struct = makeStructWithAtomCustomQuery('A'.repeat(AT_LIMIT));
      expect(() => moleculeToKet(struct)).not.toThrow();
    });

    it('throws when serializing bond with customQuery exceeding limit', () => {
      const struct = makeStructWithBondCustomQuery('A'.repeat(OVER_LIMIT));
      expect(() => moleculeToKet(struct)).toThrow(
        `Bond custom query exceeds the maximum allowed length`,
      );
    });

    it('accepts bond customQuery exactly at the limit', () => {
      const struct = makeStructWithBondCustomQuery('A'.repeat(AT_LIMIT));
      expect(() => moleculeToKet(struct)).not.toThrow();
    });
  });
});
