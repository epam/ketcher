import { ReStruct } from 'application/render/restruct';
import { restruct } from '../../mock-data';
import { SGroup } from 'domain/entities';
import { mock } from 'jest-mock-extended';
import { Render } from 'src';

describe('sgroup should calculate S-Group bounding box correctly', () => {
  it('should calculate S-Group attachments points bounding box', () => {
    const render = mock<Render>();
    render.ctab = restruct as unknown as ReStruct;
    const sGroup = new SGroup('MUL');
    sGroup.atoms = [0, 1, 2, 3, 4];
    const attachmentsSpy = jest.spyOn(
      render.ctab,
      'getRGroupAttachmentPointsVBoxByAtomIds',
    );
    SGroup.bracketPos(sGroup, restruct.molecule, {}, undefined, render);
    expect(attachmentsSpy).toHaveBeenCalled();
  });
});
