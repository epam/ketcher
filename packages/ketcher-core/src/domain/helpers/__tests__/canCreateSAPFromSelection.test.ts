import { Atom } from 'domain/entities/atom';
import { Bond } from 'domain/entities/bond';
import { Struct } from 'domain/entities/struct';
import { SuperAttachmentPoint } from 'domain/entities/superAttachmentPoint';
import { canCreateSAPFromSelection } from 'domain/helpers/canCreateSAPFromSelection';
import { Vec2 } from 'domain/entities/vec2';

function buildLinearChain(n: number) {
  const struct = new Struct();
  const fid = struct.frags.add(null);
  const atomIds: number[] = [];
  for (let i = 0; i < n; i++) {
    atomIds.push(
      struct.atoms.add(
        new Atom({ label: 'C', pp: new Vec2(i, 0), fragment: fid }),
      ),
    );
  }
  const bondIds: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    bondIds.push(
      struct.bonds.add(
        new Bond({
          begin: atomIds[i],
          end: atomIds[i + 1],
          type: Bond.PATTERN.TYPE.SINGLE,
        }),
      ),
    );
  }
  return { struct, atomIds, bondIds };
}

describe('canCreateSAPFromSelection', () => {
  it('rejects selections with fewer than 2 atoms', () => {
    const { struct, atomIds } = buildLinearChain(3);
    expect(canCreateSAPFromSelection(struct, { atoms: [] }).ok).toBe(false);
    expect(canCreateSAPFromSelection(struct, { atoms: [atomIds[0]] }).ok).toBe(
      false,
    );
  });

  it('accepts a connected pair of atoms', () => {
    const { struct, atomIds, bondIds } = buildLinearChain(3);
    const result = canCreateSAPFromSelection(struct, {
      atoms: [atomIds[0], atomIds[1]],
      bonds: [bondIds[0]],
    });
    expect(result.ok).toBe(true);
  });

  it('rejects atoms that do not form a single connected component', () => {
    const { struct, atomIds } = buildLinearChain(3);
    // atoms 0 and 2 are not directly bonded
    const result = canCreateSAPFromSelection(struct, {
      atoms: [atomIds[0], atomIds[2]],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects when an atom is already a member of another SAP', () => {
    const { struct, atomIds } = buildLinearChain(4);
    struct.superAttachmentPoints.add(
      new SuperAttachmentPoint({ atoms: [atomIds[0], atomIds[1]] }),
    );
    const result = canCreateSAPFromSelection(struct, {
      atoms: [atomIds[1], atomIds[2]],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects when selection includes other entity kinds (sgroups)', () => {
    const { struct, atomIds, bondIds } = buildLinearChain(3);
    const result = canCreateSAPFromSelection(struct, {
      atoms: [atomIds[0], atomIds[1]],
      bonds: [bondIds[0]],
      sgroups: [0],
    });
    expect(result.ok).toBe(false);
  });

  it('rejects when a selected bond connects to an atom outside the selection', () => {
    const { struct, atomIds, bondIds } = buildLinearChain(3);
    const result = canCreateSAPFromSelection(struct, {
      atoms: [atomIds[0], atomIds[1]],
      bonds: [bondIds[0], bondIds[1]],
    });
    expect(result.ok).toBe(false);
  });
});
