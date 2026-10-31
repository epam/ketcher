import {
  AttachmentGroup,
  Atom,
  Render,
  ReStruct,
  Struct,
  Vec2,
} from 'ketcher-core';
import type { RenderOptions } from 'ketcher-core';
import locate from './locate';

describe('selection locator Attachment Groups', () => {
  function buildReStruct() {
    const options = {
      microModeScale: 20,
      width: 100,
      height: 100,
    } as RenderOptions;
    const struct = new Struct();
    const atomIds = [-2, 2].map((x) =>
      struct.atoms.add(new Atom({ label: 'C', pp: new Vec2(x, 0) })),
    );
    const attachmentGroup = new AttachmentGroup({ atomIds });
    attachmentGroup.recalculatePosition(struct.atoms);
    const attachmentGroupId = struct.addAttachmentGroup(attachmentGroup);
    const render = new Render(document as unknown as HTMLElement, options);
    const restruct = new ReStruct(struct, render);
    restruct.recalculateVisibleAtomsAndBonds();

    return { attachmentGroupId, restruct };
  }

  it('includes a marker framed by rectangle selection', () => {
    const { attachmentGroupId, restruct } = buildReStruct();

    expect(
      locate.inRectangle(restruct, new Vec2(-1, -1), new Vec2(1, 1))
        .attachmentGroups,
    ).toEqual([attachmentGroupId]);
  });

  it('includes a marker framed by freehand selection', () => {
    const { attachmentGroupId, restruct } = buildReStruct();

    expect(
      locate.inPolygon(restruct, [
        new Vec2(-1, -1),
        new Vec2(1, -1),
        new Vec2(1, 1),
        new Vec2(-1, 1),
      ]).attachmentGroups,
    ).toEqual([attachmentGroupId]);
  });
});
