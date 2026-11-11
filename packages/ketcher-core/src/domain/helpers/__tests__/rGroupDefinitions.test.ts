import { getRGroupDefinitions } from '../rGroupDefinitions';
import { rGroupLogicToString } from '../rGroupLogic';
import { Atom } from 'domain/entities/CoreAtom';
import { Atom as StructAtom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/CoreBond';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { Struct } from 'domain/entities/struct';
import { RGroup } from 'domain/entities/rgroup';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel } from 'domain/constants';
import { DrawingEntitiesManager } from 'domain/entities/DrawingEntitiesManager';
import { RGroupDrawingEntity } from 'domain/entities/RGroupDrawingEntity';
import * as editorSingleton from 'application/editor/editorSingleton';
import type { CoreEditor } from 'application/editor/Editor';
import type { BaseRenderer } from 'application/render/renderers/BaseRenderer';

function fragment(rgroupId?: number) {
  const struct = new Struct();
  const atoms = [0, 1].map((x) => {
    const atom = new StructAtom({ label: 'C', pp: new Vec2(x, 0) });
    atom.fragment = 0;
    struct.atoms.add(atom);
    return atom;
  });
  if (rgroupId !== undefined) {
    const rgroup = new RGroup({ range: '1-3', resth: true, ifthen: 2 });
    rgroup.frags.add(0);
    struct.rgroups.set(rgroupId, rgroup);
  }
  const monomer = { monomerItem: { struct } } as BaseMonomer;
  const coreAtoms = atoms.map(
    (atom, id) => new Atom(atom.pp, monomer, id, AtomLabel.C),
  );
  const bond = new Bond(coreAtoms[0], coreAtoms[1], 0);
  return { atoms: coreAtoms, bond, struct };
}

describe('R-group definitions in macromolecules mode', () => {
  afterEach(() => jest.restoreAllMocks());

  it.each(['rectangle', 'lasso'])(
    'keeps individual atom selection with %s',
    (tool) => {
      jest.spyOn(editorSingleton, 'provideEditorInstance').mockReturnValue({
        mode: { modeName: 'flex-layout-mode' },
      } as CoreEditor);
      const first = fragment(1);
      const second = fragment(1);
      second.atoms.forEach((atom) => atom.moveRelative(new Vec2(0, 3)));
      const ordinary = fragment();
      ordinary.atoms.forEach((atom) => atom.moveRelative(new Vec2(5, 0)));
      const manager = new DrawingEntitiesManager();
      [first, second, ordinary].forEach(({ atoms, bond }) => {
        atoms.forEach((atom) => {
          manager.atoms.set(atom.id, atom);
          atom.setBaseRenderer({
            selectionPoints: [atom.position.scaled(40)],
          } as BaseRenderer);
        });
        manager.bonds.set(bond.id, bond);
        bond.setBaseRenderer({
          selectionPoints: [bond.center.scaled(40)],
        } as BaseRenderer);
      });
      if (tool === 'rectangle') {
        manager.selectIfLocatedInRectangle(
          new Vec2(-1, -1),
          new Vec2(1, 1),
          [],
        );
      } else {
        manager.selectIfLocatedInPolygon(
          [new Vec2(-1, -1), new Vec2(1, -1), new Vec2(1, 1), new Vec2(-1, 1)],
          [],
        );
      }
      expect(manager.selectedEntitiesArr).toEqual([first.atoms[0]]);
      expect(second.atoms.some((atom) => atom.selected)).toBe(false);
      expect(second.bond.selected).toBe(false);
      expect(ordinary.atoms.some((atom) => atom.selected)).toBe(false);
      const movement = manager.moveSelectedDrawingEntities(new Vec2(2, 1));
      movement.operations.forEach((operation) =>
        operation.execute(undefined as never),
      );
      expect(first.atoms[0].position).toEqual(new Vec2(2, 1));
      expect(first.atoms[1].position).toEqual(new Vec2(1, 0));
      expect(second.atoms[0].position).toEqual(new Vec2(0, 3));
    },
  );

  it('groups alternatives across molecules without mixing local fragment IDs', () => {
    const first = fragment(1);
    const second = fragment(1);
    const otherGroup = fragment(2);
    const ordinary = fragment();
    const fragments = [first, second, otherGroup, ordinary];
    const definitions = getRGroupDefinitions(
      fragments.flatMap(({ atoms }) => atoms),
      fragments.map(({ bond }) => bond),
    );
    expect([...definitions.keys()]).toEqual([1, 2]);
    expect(definitions.get(1)?.atoms).toEqual([
      ...first.atoms,
      ...second.atoms,
    ]);
    expect(definitions.get(1)?.bonds).toEqual([first.bond, second.bond]);
    expect(definitions.get(2)?.atoms).toEqual(otherGroup.atoms);
  });

  it('selects all alternatives and bonds when selecting the definition', () => {
    const first = fragment(1);
    const second = fragment(1);
    const ordinary = fragment();
    const manager = new DrawingEntitiesManager();
    const atoms = [...first.atoms, ...second.atoms, ...ordinary.atoms];
    atoms.forEach((atom) => manager.atoms.set(atom.id, atom));
    [first.bond, second.bond, ordinary.bond].forEach((bond) =>
      manager.bonds.set(bond.id, bond),
    );
    const definition = getRGroupDefinitions(
      manager.atoms.values(),
      manager.bonds.values(),
    ).get(1)!;
    manager.getAllSelectedEntitiesForSingleEntity(
      new RGroupDrawingEntity(
        1,
        definition.rgroup,
        definition.atoms,
        definition.bonds,
      ),
    );
    expect(manager.selectedEntitiesArr).toHaveLength(6);
    expect(definition.atoms.every((atom) => atom.selected)).toBe(true);
    expect(definition.bonds.every((bond) => bond.selected)).toBe(true);
    expect(ordinary.atoms.some((atom) => atom.selected)).toBe(false);

    const movement = manager.moveSelectedDrawingEntities(new Vec2(3, 2));
    // Model changes execute before render callbacks in the command lifecycle.
    movement.operations.forEach((operation) =>
      operation.execute(undefined as never),
    );
    expect(first.atoms[0].position).toEqual(new Vec2(3, 2));
    expect(second.atoms[0].position).toEqual(new Vec2(3, 2));
    expect(ordinary.atoms[0].position).toEqual(new Vec2(0, 0));
    movement.operations.forEach((operation) =>
      operation.invert(undefined as never),
    );
    expect(first.atoms[0].position).toEqual(new Vec2(0, 0));
    expect(second.atoms[0].position).toEqual(new Vec2(0, 0));
  });
});

describe('R-group logic shared by both renderers', () => {
  it.each([
    ['', false, 0, 'R1>0'],
    ['1-3', true, 2, 'IF R1=1-3 (RestH)\nTHEN R2'],
    ['>2', false, 0, 'R1>2'],
    ['<3', false, 0, 'R1<3'],
    ['=2', false, 0, 'R1=2'],
  ])(
    'formats occurrence %s, RestH %s and condition %s',
    (range, resth, ifthen, expected) => {
      expect(rGroupLogicToString(1, new RGroup({ range, resth, ifthen }))).toBe(
        expected,
      );
    },
  );
});
