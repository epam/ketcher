import { AttachmentPoint } from '@utils/macromolecules/monomer';

export enum MonomerOverview {
  LeftMonomer = 'left-monomer-overview',
  RightMonomer = 'right-monomer-overview',
}

export const LeftMonomerConnectionPointButton: Record<AttachmentPoint, string> =
  {
    [AttachmentPoint.R1]: 'left-R1',
    [AttachmentPoint.R2]: 'left-R2',
    [AttachmentPoint.R3]: 'left-R3',
    [AttachmentPoint.R4]: 'left-R4',
    [AttachmentPoint.R5]: 'left-R5',
    [AttachmentPoint.R6]: 'left-R6',
    [AttachmentPoint.R7]: 'left-R7',
    [AttachmentPoint.R8]: 'left-R8',
  };

export const RightMonomerConnectionPointButton: Record<
  AttachmentPoint,
  string
> = {
  [AttachmentPoint.R1]: 'right-R1',
  [AttachmentPoint.R2]: 'right-R2',
  [AttachmentPoint.R3]: 'right-R3',
  [AttachmentPoint.R4]: 'right-R4',
  [AttachmentPoint.R5]: 'right-R5',
  [AttachmentPoint.R6]: 'right-R6',
  [AttachmentPoint.R7]: 'right-R7',
  [AttachmentPoint.R8]: 'right-R8',
};

export enum LeftLeavingGroupValue {
  R1 = 'left-R1-leaving-group-value',
  R2 = 'left-R2-leaving-group-value',
  R3 = 'left-R3-leaving-group-value',
  R4 = 'left-R4-leaving-group-value',
  R5 = 'left-R5-leaving-group-value',
  R6 = 'left-R6-leaving-group-value',
  R7 = 'left-R7-leaving-group-value',
  R8 = 'left-R8-leaving-group-value',
}

export enum RightLeavingGroupValue {
  R1 = 'right-R1-leaving-group-value',
  R2 = 'right-R2-leaving-group-value',
  R3 = 'right-R3-leaving-group-value',
  R4 = 'right-R4-leaving-group-value',
  R5 = 'right-R5-leaving-group-value',
  R6 = 'right-R6-leaving-group-value',
  R7 = 'right-R7-leaving-group-value',
  R8 = 'right-R8-leaving-group-value',
}
