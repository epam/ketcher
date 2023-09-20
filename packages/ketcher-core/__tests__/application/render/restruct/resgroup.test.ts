/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ReRGroupAttachmentPoint,
  ReSGroup,
  ReStruct,
  Render,
} from 'application/render';
import {
  Bond,
  Pool,
  RGroupAttachmentPoint,
  SGroup,
  Struct,
  Vec2,
} from 'domain/entities';
import { restruct } from '../../../mock-data';
import { mockFn } from 'jest-mock-extended';
import { RenderOptions } from 'application/render/render.types';

describe('resgroup should draw brackets with attachment points correctly', () => {
  const mockBonds = [
    {
      angle: 30.00072778082736,
      begin: 0,
      center: { x: 9.333006350829672, y: 6.574988999717658, z: 0 },
      end: 1,
      hb1: 0,
      hb2: 1,
      len: 39.99970665913751,
      reactingCenterStatus: 0,
      sa: 15.999853329568754,
      sb: 10,
      stereo: 0,
      topology: 0,
      type: 1,
      xxx: '   ',
    },
    {
      angle: 90,
      begin: 1,
      center: { x: 9.766012701659344, y: 7.325, z: 0 },
      end: 2,
      hb1: 2,
      hb2: 3,
      len: 40.00058668172494,
      reactingCenterStatus: 0,
      sa: 16.00029334086247,
      sb: 10,
      stereo: 0,
      topology: 0,
      type: 2,
      xxx: '   ',
    },
    {
      angle: 149.99927221917264,
      begin: 2,
      center: { x: 9.333006350829672, y: 8.075011000282341, z: 0 },
      end: 3,
      hb1: 4,
      hb2: 5,
      len: 39.99970665913751,
      reactingCenterStatus: 0,
      sa: 15.999853329568754,
      sb: 10,
      stereo: 0,
      topology: 0,
      type: 1,
      xxx: '   ',
    },
    {
      angle: -149.99927221917264,
      begin: 3,
      center: { x: 8.466993649170329, y: 8.075011000282341, z: 0 },
      end: 4,
      hb1: 6,
      hb2: 7,
      len: 39.99970665913751,
      reactingCenterStatus: 0,
      sa: 15.999853329568754,
      sb: 10,
      stereo: 0,
      topology: 0,
      type: 2,
      xxx: '   ',
    },
  ];
  let reSgroup;
  let sGroup;
  let attachmentsSpy;
  beforeEach(() => {
    const primaryAttachmentPoint = new RGroupAttachmentPoint(2, 'primary');
    restruct.molecule.rgroupAttachmentPoints.add(primaryAttachmentPoint);
    const reRGroupAttachmentPoint = new ReRGroupAttachmentPoint(
      primaryAttachmentPoint,
      {} as any,
    );
    reRGroupAttachmentPoint.lineDirectionVector = new Vec2({
      x: 8.466993649170329,
      y: 6.574988999717658,
      z: 0,
    });
    restruct.rgroupAttachmentPoints.set(0, reRGroupAttachmentPoint);
    const option = { scale: 20, width: 100, height: 100 } as RenderOptions;
    const render = new Render(document as unknown as HTMLElement, option);
    render.ctab = restruct as unknown as ReStruct;
    restruct.render = render as any;
    sGroup = new SGroup('MUL');
    reSgroup = new ReSGroup(sGroup);
    sGroup.isNotContractible = mockFn().mockReturnValue(false);
    SGroup.addAtom(sGroup, 2, restruct.molecule as unknown as Struct);
    attachmentsSpy = jest.spyOn(
      render.ctab,
      'getRGroupAttachmentPointsVBoxByAtomIds',
    );
    const bonds = new Pool();
    mockBonds.forEach((bond, i) => bonds.set(i, new Bond(bond)));
    restruct.molecule.bonds = bonds;
  });

  it('should draw brackets with attachment points with more than 2 cross bonds per atom with 1 attachment point', () => {
    const bonds = new Pool();
    mockBonds.forEach((bond, i) => bonds.set(i, new Bond(bond)));
    restruct.molecule.bonds = bonds;
    reSgroup.draw(restruct, sGroup);
    expect(attachmentsSpy).toHaveBeenCalled();
  });

  it('should draw brackets with attachment points with more than 2 cross bonds per atom with 2 attachment points', () => {
    const secondAttachmentPoint = new RGroupAttachmentPoint(2, 'secondary');
    restruct.molecule.rgroupAttachmentPoints.add(secondAttachmentPoint);
    const reRGroupAttachmentPoint = new ReRGroupAttachmentPoint(
      secondAttachmentPoint,
      {} as any,
    );
    reRGroupAttachmentPoint.lineDirectionVector = new Vec2({
      x: -7.6009730086857115,
      y: 6.5749954165843185,
      z: 0,
    });
    restruct.rgroupAttachmentPoints.set(1, reRGroupAttachmentPoint);
    restruct.molecule.getRGroupAttachmentPointsByAtomId =
      mockFn().mockReturnValue([0, 1]);
    reSgroup.draw(restruct, sGroup);
    expect(attachmentsSpy).toHaveBeenCalled();
  });

  it('should draw brackets with attachment points with 2 cross bonds on 2 atom', () => {
    const secondAttachmentPoint = new RGroupAttachmentPoint(3, 'secondary');
    restruct.molecule.rgroupAttachmentPoints.add(secondAttachmentPoint);
    const reRGroupAttachmentPoint = new ReRGroupAttachmentPoint(
      secondAttachmentPoint,
      {} as any,
    );
    reRGroupAttachmentPoint.lineDirectionVector = new Vec2({
      x: -7.6009730086857115,
      y: 6.5749954165843185,
      z: 0,
    });
    restruct.rgroupAttachmentPoints.set(1, reRGroupAttachmentPoint);
    SGroup.addAtom(sGroup, 3, restruct.molecule as unknown as Struct);
    restruct.molecule.getRGroupAttachmentPointsByAtomId = mockFn()
      .mockReturnValue([0])
      .mockReturnValueOnce([1]);
    reSgroup.draw(restruct, sGroup);
    expect(attachmentsSpy).toHaveBeenCalled();
  });
});
