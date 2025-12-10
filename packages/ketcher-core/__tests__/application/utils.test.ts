import { Atom, Bond, Struct } from 'domain/entities';
import { getSelectionFromStruct } from 'application/utils';

describe('getSelectionFromStruct', () => {
  it('should return empty selection for struct without selected items', () => {
    const struct = new Struct();
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } }),
    );
    const atomId2 = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } }),
    );
    struct.bonds.add(new Bond({ begin: atomId, end: atomId2, type: 1 }));

    const selection = getSelectionFromStruct(struct);

    expect(selection).toEqual({});
  });

  it('should return selection with selected atoms', () => {
    const struct = new Struct();
    const atom1 = new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } });
    atom1.setInitiallySelected(true);
    const atomId1 = struct.atoms.add(atom1);

    const atom2 = new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } });
    const atomId2 = struct.atoms.add(atom2);

    const selection = getSelectionFromStruct(struct);

    expect(selection.atoms).toEqual([atomId1]);
    expect(selection.bonds).toBeUndefined();
  });

  it('should return selection with selected bonds', () => {
    const struct = new Struct();
    const atomId1 = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } }),
    );
    const atomId2 = struct.atoms.add(
      new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } }),
    );

    const bond = new Bond({ begin: atomId1, end: atomId2, type: 1 });
    bond.setInitiallySelected(true);
    const bondId = struct.bonds.add(bond);

    const selection = getSelectionFromStruct(struct);

    expect(selection.bonds).toEqual([bondId]);
    expect(selection.atoms).toBeUndefined();
  });

  it('should return selection with both selected atoms and bonds', () => {
    const struct = new Struct();

    const atom1 = new Atom({ label: 'C', pp: { x: 0, y: 0, z: 0 } });
    atom1.setInitiallySelected(true);
    const atomId1 = struct.atoms.add(atom1);

    const atom2 = new Atom({ label: 'C', pp: { x: 1, y: 0, z: 0 } });
    atom2.setInitiallySelected(true);
    const atomId2 = struct.atoms.add(atom2);

    const bond = new Bond({ begin: atomId1, end: atomId2, type: 1 });
    bond.setInitiallySelected(true);
    const bondId = struct.bonds.add(bond);

    const selection = getSelectionFromStruct(struct);

    expect(selection.atoms).toEqual([atomId1, atomId2]);
    expect(selection.bonds).toEqual([bondId]);
  });
});
