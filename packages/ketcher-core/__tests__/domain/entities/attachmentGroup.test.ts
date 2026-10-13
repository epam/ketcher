import { AttachmentGroup, Atom, Bond, Struct, Vec2 } from 'domain/entities';

describe('AttachmentGroup', () => {
  it('is a bond endpoint without being a chemical atom', () => {
    const attachmentGroup = new AttachmentGroup({ atomIds: [1, 2] });

    expect(attachmentGroup).not.toBeInstanceOf(Atom);
    expect(attachmentGroup.neighbors).toEqual([]);
  });

  it('positions its marker at the center of the member atom bounding box', () => {
    const struct = new Struct();
    const atomIds = [
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(0, 0) })),
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(4, 0) })),
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(4, 10) })),
    ];
    const attachmentGroup = new AttachmentGroup({ atomIds });

    expect(attachmentGroup.recalculatePosition(struct.atoms)).toEqual(
      new Vec2(2, 5),
    );
  });

  it('finds bonds connected to atom and attachment group endpoints', () => {
    const struct = new Struct();
    const firstAtomId = struct.atoms.add(new Atom({ label: 'C' }));
    const secondAtomId = struct.atoms.add(new Atom({ label: 'Fe' }));
    const attachmentGroupId = struct.addAttachmentGroup(
      new AttachmentGroup({ atomIds: [firstAtomId] }),
    );
    const atomBondId = struct.bonds.add(
      new Bond({
        begin: firstAtomId,
        end: secondAtomId,
        type: Bond.PATTERN.TYPE.SINGLE,
      }),
    );
    const hapticBondId = struct.bonds.add(
      new Bond({
        begin: attachmentGroupId,
        end: secondAtomId,
        type: Bond.PATTERN.TYPE.HAPTIC,
      }),
    );

    expect(struct.getConnectedBondIds(secondAtomId)).toEqual([
      atomBondId,
      hapticBondId,
    ]);
    expect(struct.getConnectedBondIds(attachmentGroupId)).toEqual([
      hapticBondId,
    ]);
  });
});
