import { Atom, SGroup, Struct, Vec2 } from 'domain/entities';
import { MonomerMicromolecule } from 'domain/entities/monomerMicromolecule';
import { Molfile } from '../molfile';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { geometricCenter, getAtomPositions } from 'domain/entities/geometry';

const PRECISION = 4;

function buildMonomerStruct(
  monomerLabel: string,
  monomerPosition: Vec2,
  atomOffsets: Vec2[],
): Struct {
  const struct = new Struct();

  const mockMonomer = {
    label: monomerLabel,
    monomerItem: { label: monomerLabel },
  } as unknown as BaseMonomer;

  const sgroup = new MonomerMicromolecule(SGroup.TYPES.SUP, mockMonomer);
  sgroup.pp = monomerPosition;
  sgroup.data.name = monomerLabel;

  const sgroupId = struct.sgroups.add(sgroup);
  sgroup.id = sgroupId;

  for (const offset of atomOffsets) {
    const atomId = struct.atoms.add(
      new Atom({ label: 'C', pp: monomerPosition.add(offset) }),
    );
    struct.atomAddToSGroup(sgroupId, atomId);
  }

  return struct;
}

function findSgroupByName(struct: Struct, name: string): SGroup | undefined {
  let found: SGroup | undefined;
  struct.sgroups.forEach((sg) => {
    if (sg.data.name === name) found = sg;
  });
  return found;
}

function roundTrip(struct: Struct): Struct {
  const v2000 = new Molfile().saveMolecule(struct, true);
  return new Molfile().parseCTFile({ molfileLines: v2000.split('\n') });
}

describe('centerMonomerMicromoleculeAtoms', () => {
  it('geometric center of sgroup atoms in v2000 equals monomer position from KET', () => {
    const monomerPosition = new Vec2(5, 3);
    // Atom offsets are NOT centered at origin — simulating real molecular geometry
    const atomOffsets = [
      new Vec2(0.3, 0.5),
      new Vec2(-0.5, -0.2),
      new Vec2(0.8, -0.4),
    ];

    const parsed = roundTrip(
      buildMonomerStruct('TestMon', monomerPosition, atomOffsets),
    );

    const sgroup = findSgroupByName(parsed, 'TestMon');
    expect(sgroup).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const positions = getAtomPositions(sgroup!.atoms, parsed.atoms);
    const center = geometricCenter(positions);
    expect(center.x).toBeCloseTo(monomerPosition.x, PRECISION);
    expect(center.y).toBeCloseTo(monomerPosition.y, PRECISION);
  });

  it('works when atoms are already centered at monomer position', () => {
    const monomerPosition = new Vec2(2, 4);
    // Offsets that already sum to zero (centered)
    const atomOffsets = [
      new Vec2(1, 0),
      new Vec2(-1, 0),
      new Vec2(0, 1),
      new Vec2(0, -1),
    ];

    const parsed = roundTrip(
      buildMonomerStruct('CenMon', monomerPosition, atomOffsets),
    );

    const sgroup = findSgroupByName(parsed, 'CenMon');
    expect(sgroup).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const positions = getAtomPositions(sgroup!.atoms, parsed.atoms);
    const center = geometricCenter(positions);
    expect(center.x).toBeCloseTo(monomerPosition.x, PRECISION);
    expect(center.y).toBeCloseTo(monomerPosition.y, PRECISION);
  });

  it('preserves relative atom geometry after centering', () => {
    const monomerPosition = new Vec2(0, 0);
    const atomOffsets = [new Vec2(1, 0), new Vec2(-1, 0), new Vec2(0, 0.5)];

    const parsed = roundTrip(
      buildMonomerStruct('GeoMon', monomerPosition, atomOffsets),
    );

    const sgroup = findSgroupByName(parsed, 'GeoMon');
    expect(sgroup).toBeDefined();

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const parsedPositions = getAtomPositions(sgroup!.atoms, parsed.atoms);

    // Bond length between first two atoms should be preserved (distance = 2)
    const dx = parsedPositions[0].x - parsedPositions[1].x;
    const dy = parsedPositions[0].y - parsedPositions[1].y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    expect(distance).toBeCloseTo(2, PRECISION);
  });
});
