import {
  AttachmentGroup,
  Atom,
  Bond,
  Render,
  ReStruct,
  Struct,
  Vec2,
} from 'ketcher-core';
import type { RenderOptions } from 'ketcher-core';
import closest from './closest';

// Regression test for https://github.com/epam/ketcher/issues/346:
// findCloseMerge (closest.merge) must skip a bond whose atom was already
// deleted by an earlier merge in the same batch, not throw.
describe('closest.merge (findCloseMerge): stale bond references', () => {
  function buildReStruct() {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, options);
    return new ReStruct(new Struct(), render);
  }

  it('does not throw when a selected bond references an already-deleted atom', () => {
    const restruct = buildReStruct();
    const struct = restruct.molecule;

    const beginId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(0, 0), fragment: 0 }),
    );
    const endId = struct.atoms.add(
      new Atom({ label: 'C', pp: new Vec2(1, 0), fragment: 0 }),
    );
    const bondId = struct.bonds.add(
      new Bond({ begin: beginId, end: endId, type: Bond.PATTERN.TYPE.SINGLE }),
    );

    // Bond still present, but one of its atoms was already merged away.
    struct.atoms.delete(endId);

    expect(() =>
      closest.merge(
        restruct,
        { atoms: [], bonds: [bondId] },
        restruct.render.options,
        [],
      ),
    ).not.toThrow();
  });
});

describe('closest.item', () => {
  it('prioritizes an Attachment Group marker that coincides with a member atom', () => {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const struct = new Struct();
    const atomIds = [0, 1, 2].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
    );
    const attachmentGroup = new AttachmentGroup({ atomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    restruct.recalculateVisibleAtomsAndBonds();

    expect(
      closest.item(
        restruct,
        attachmentGroup.pp,
        ['atoms', 'attachmentGroups'],
        null,
        options,
      ),
    ).toMatchObject({ map: 'attachmentGroups', id: attachmentGroupId });
  });
});
