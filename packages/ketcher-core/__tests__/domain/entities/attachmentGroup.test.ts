import { AttachmentGroup, Atom, Struct, Vec2 } from 'domain/entities';

describe('AttachmentGroup', () => {
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
});
