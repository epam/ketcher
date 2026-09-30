import { vi } from 'vitest';
import { type ReStruct, ReRGroup } from 'application/render/restruct';
import { restruct } from '../../../mock-data';
import { RGroup } from 'domain/entities';
import type { Render } from 'src';

describe('rergroup should calculate R-Group bounding box correctly', () => {
  it('should calculate R-Group attachments points bounding box', () => {
    const render = {
      ctab: restruct as unknown as ReStruct,
    } as unknown as Render;
    const rGroup = new RGroup();
    rGroup.frags.add(0);
    const rerGroup = new ReRGroup(rGroup);
    rerGroup.getAtoms = vi.fn().mockReturnValue(restruct.molecule.atoms);
    const attachmentsSpy = vi.spyOn(
      render.ctab,
      'getRGroupAttachmentPointsVBoxByAtomIds',
    );
    rerGroup.calcBBox(render);
    expect(attachmentsSpy).toHaveBeenCalled();
  });
});
