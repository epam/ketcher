import { Atom as MicroAtom, AttachmentPoints } from 'domain/entities/atom';
import { Bond as MicroBond } from 'domain/entities/bond';
import { Atom as MacroAtom } from 'domain/entities/CoreAtom';
import { Bond as MacroBond, BondType } from 'domain/entities/CoreBond';
import { Struct } from 'domain/entities/struct';
import { Vec2 } from 'domain/entities/vec2';
import { AtomLabel } from 'domain/constants';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { RGroupAttachmentPoint } from 'domain/entities/rgroupAttachmentPoint';
import ReAtom from 'application/render/restruct/reatom';
import { ReRGroupAttachmentPoint } from 'application/render/restruct/rergroupAttachmentPoint';
import { getRGroupAttachmentPointDirection } from 'application/render/renderers/rGroupAttachmentPointGeometry';

describe('micro/macro attachment-point adapters', () => {
  it.each([
    { type: 'primary' as const, both: false, bonds: [BondType.Single] },
    { type: 'primary' as const, both: false, bonds: [BondType.Triple] },
    {
      type: 'secondary' as const,
      both: false,
      bonds: [BondType.Double, BondType.Single],
    },
    { type: 'primary' as const, both: true, bonds: [BondType.Single] },
    {
      type: 'secondary' as const,
      both: true,
      bonds: [BondType.Single, BondType.Double],
    },
  ])('agree for $type, both=$both, bonds=$bonds', ({ type, both, bonds }) => {
    const struct = new Struct();
    const source = new MicroAtom({
      label: 'C',
      pp: new Vec2(),
      attachmentPoints: both
        ? AttachmentPoints.BothSides
        : AttachmentPoints.FirstSideOnly,
    });
    struct.atoms.add(source);
    const monomer = { monomerItem: { struct } } as BaseMonomer;
    const atom = new MacroAtom(source.pp, monomer, 0, AtomLabel.C);
    bonds.forEach((bondType, index) => {
      const angle = (index * Math.PI) / 2;
      const position = new Vec2(Math.cos(angle), Math.sin(angle));
      const id = struct.atoms.add(new MicroAtom({ label: 'C', pp: position }));
      struct.bonds.add(new MicroBond({ begin: 0, end: id, type: bondType }));
      const neighbor = new MacroAtom(position, monomer, id, AtomLabel.C);
      atom.addBond(new MacroBond(atom, neighbor, index, bondType));
    });
    struct.initHalfBonds();
    struct.initNeighbors();
    struct.halfBonds.forEach((halfBond) => {
      const direction = struct.atoms
        .get(halfBond.end)!
        .pp.sub(struct.atoms.get(halfBond.begin)!.pp);
      halfBond.ang = Math.atan2(direction.y, direction.x);
    });
    const micro = new ReRGroupAttachmentPoint(
      new RGroupAttachmentPoint(0, type),
      new ReAtom(source),
    );
    // Compare the adapters without coupling this test to either SVG library.
    const microDirection = (
      micro as unknown as {
        getAttachmentPointDirectionVector(struct: Struct): Vec2;
      }
    ).getAttachmentPointDirectionVector(struct);
    const macroDirection = getRGroupAttachmentPointDirection(atom, type, both);
    expect(macroDirection.x).toBeCloseTo(microDirection.x);
    expect(macroDirection.y).toBeCloseTo(microDirection.y);
  });
});
