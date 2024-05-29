import { Smiles } from '../smiles';
import { Struct } from 'domain/entities';
import { Atom } from '../../../entities';

let smiles = new Smiles();
const struct = new Struct();
struct.atoms.add(new Atom({ label: 'A' }));
struct.atoms.add(new Atom({ label: 'R' }));
struct.atoms.add(new Atom({ label: 'D' }));
struct.atoms.add(new Atom({ label: 'Be', hCount: 0 }));
struct.atoms.add(new Atom({ label: 'V', isotope: 2 }));
struct.atoms.add(new Atom({ label: 'O', isotope: 2 }));
struct.atoms.add(new Atom({ label: 'H', charge: 1 }));
struct.atoms.add(new Atom({ label: 'H', charge: 2 }));
struct.atoms.add(new Atom({ label: 'H', charge: -1 }));
struct.atoms.add(new Atom({ label: 'H', charge: -2 }));
struct.atoms.add(new Atom({ label: 'C' }));

describe('Smiles.writeAtom method', () => {
  beforeEach(() => {
    smiles = new Smiles();
    smiles.saveMolecule(struct, true);
    smiles.smiles = '';
  });

  it.each([
    [0, '*'],
    [2, '*'],
  ])(
    'should add * to smiles if label is A or other generic atom except R(#)',
    (index, expected) => {
      // const index = 0
      smiles.writeAtom(struct, index);
      expect(smiles.smiles).toBe(expected);
    },
  );
  it('should add [*] to smiles if label is R(#)', () => {
    const index = 1;
    smiles.writeAtom(struct, index);
    expect(smiles.smiles).toBe('[*]');
  });
  it('should add atom symbol in square brackets to smiles if label is non-hydrogen atom', () => {
    const index = 3;
    smiles.writeAtom(struct, index);
    expect(smiles.smiles).toBe('[Be]');
  });
  it('should add atom symbol without square brackets to smiles', () => {
    const index = 10;
    smiles.writeAtom(struct, index);
    expect(smiles.smiles).toBe('C');
  });
  it('should add atom isotope to smiles', () => {
    const index = 4;
    smiles.writeAtom(struct, index);
    expect(smiles.smiles).toBe('[2V]');
  });
  it('should add atom and H in square brackets to smiles if it has hydro', () => {
    const index = 5;
    smiles.writeAtom(struct, index);
    expect(smiles.smiles).toBe('[2OH2]');
  });
  it.each([
    [6, '[H+]'],
    [7, '[H+2]'],
    [8, '[H-]'],
    [9, '[H-2]'],
  ])('should add atom charge to smiles', (index, expected) => {
    smiles.writeAtom(struct, index);
    expect(smiles.smiles).toBe(expected);
  });
  it.each([
    [1, '[Be@]'],
    [2, '[Be@@]'],
  ])('should add chirality to smiles', (chirality, expected) => {
    const index = 3;
    smiles.writeAtom(struct, index, false, false, chirality);
    expect(smiles.smiles).toBe(expected);
  });
});
