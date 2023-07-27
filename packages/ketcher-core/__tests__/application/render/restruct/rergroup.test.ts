import { ReRGroup, ReStruct } from 'application/render/restruct';
import { restruct } from '../../../mock-data';
import { RGroup } from 'domain/entities';
import { mock, mockFn } from 'jest-mock-extended';
import { Render } from 'src';

describe('rergroup should calculate R-Group bounding box correctly', () => {
  it('should calculate R-Group attachments points bounding box', () => {
    const render = mock<Render>();
    render.ctab = { ...restruct.molecule } as unknown as ReStruct;
    const rGroup = new RGroup();
    rGroup.frags.add(0);
    const rerGroup = new ReRGroup(rGroup);
    rerGroup.getAtoms = mockFn().mockReturnValue(restruct.molecule.atoms);
    const attachmentsSpy = jest.spyOn(render.ctab, 'getAttachmentsPointsVBox');
    rerGroup.calcBBox(render);
    expect(attachmentsSpy).toHaveBeenCalled();
  });
});
