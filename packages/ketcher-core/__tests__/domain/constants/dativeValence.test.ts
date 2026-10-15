import { Atom } from 'domain/entities/atom';
import { Elements } from 'domain/constants';
import {
  DATIVE_IMPLICIT_HYDROGEN_LABELS,
  DATIVE_VALENCE_TABLE,
} from 'domain/constants/dativeValence';
import type { ElementLabel } from 'domain/constants/element.types';

const standaloneAtomParams = {
  aam: 0,
  alias: null,
  atomList: null,
  attachmentPoints: null,
  badConn: false,
  charge: 0,
  exactChangeFlag: 0,
  explicitValence: -1,
  fragment: 0,
  hCount: 0,
  implicitH: 0,
  invRet: 0,
  isotope: 0,
  neighbors: [],
  pseudo: '',
  radical: 0,
  rglabel: null,
  ringBondCount: 0,
  rxnFragmentType: -1,
  sgs: new Set(),
  stereoLabel: null,
  stereoParity: 0,
  substitutionCount: 0,
  unsaturatedAtom: 0,
  valence: 1,
};

describe('DATIVE_VALENCE_TABLE', () => {
  it('has exactly one entry for each of the 118 elements', () => {
    const tableLabels = Object.keys(DATIVE_VALENCE_TABLE).sort();
    const elementLabels = Elements.getAll()
      .map((element) => element.label)
      .sort();

    expect(tableLabels).toHaveLength(118);
    expect(tableLabels).toEqual(elementLabels);
  });

  it('keeps valence electrons within 1..16 and orbitals within the s/p, d, f layouts', () => {
    for (const { valenceElectrons, valenceOrbitals } of Object.values(
      DATIVE_VALENCE_TABLE,
    )) {
      expect(valenceElectrons).toBeGreaterThanOrEqual(1);
      expect(valenceElectrons).toBeLessThanOrEqual(16);
      expect([1, 4, 9, 16]).toContain(valenceOrbitals);
    }
  });

  it.each<[ElementLabel, number, number]>([
    ['H', 1, 1],
    ['He', 2, 1],
    ['C', 4, 4],
    ['Cl', 7, 4],
    ['Mg', 2, 9],
    ['Ni', 10, 9],
    ['Pt', 10, 9],
    ['Pr', 5, 16],
    ['Og', 8, 4],
  ])(
    '%s has El0 = %i and Or0 = %i',
    (label, valenceElectrons, valenceOrbitals) => {
      expect(DATIVE_VALENCE_TABLE[label]).toEqual({
        valenceElectrons,
        valenceOrbitals,
      });
    },
  );
});

describe('DATIVE_IMPLICIT_HYDROGEN_LABELS', () => {
  it('equals the labels legacy calcValence draws implicit hydrogens for as standalone atoms, without Pt', () => {
    const legacyLabels = new Set<string>();
    for (const label of Object.keys(DATIVE_VALENCE_TABLE)) {
      const atom = new Atom({ ...standaloneAtomParams, label });
      atom.calcValence(0);
      if (atom.implicitH > 0) {
        legacyLabels.add(label);
      }
    }
    expect(legacyLabels.has('Pt')).toBe(true);
    legacyLabels.delete('Pt');

    expect(legacyLabels.size).toBe(32);
    expect(new Set(DATIVE_IMPLICIT_HYDROGEN_LABELS)).toEqual(legacyLabels);
  });

  it.each(['He', 'Ne', 'Ar', 'Fe', 'Co', 'Ni', 'Pt', 'Be', 'Mg', 'La', 'Pr'])(
    'excludes %s, which is drawn without implicit hydrogens',
    (label) => {
      expect(DATIVE_IMPLICIT_HYDROGEN_LABELS.has(label as ElementLabel)).toBe(
        false,
      );
    },
  );
});
