/**
 * Unit tests for RNABase.getValidSourcePoint.
 *
 * The method decides whether a bond from a base can be resolved without asking
 * the user: returning an attachment point creates the bond straight away, while
 * returning undefined makes the caller open the "Select Attachment Points"
 * dialog (see LibraryItemDragDropHandler).
 *
 * The only default bond a base takes part in is sugar R3 - base R1
 * (requirement #7926, 2.1). Against any other partner a base with several free
 * attachment points is ambiguous and the user has to choose (#7926, 2.2 and
 * example 3 of 3.3 - issue #11467). Only stub the properties the method reads.
 */
import { RNABase } from 'domain/entities/RNABase';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'application/formatters';

type MonomerStub = {
  freeAttachmentPoints?: AttachmentPointName[];
  chosenFirstAttachmentPointForBond?: AttachmentPointName | null;
  potentialSecondAttachmentPointForBond?: AttachmentPointName | null;
  monomerClass?: KetMonomerClass;
};

function makeMonomer({
  freeAttachmentPoints = [AttachmentPointName.R1, AttachmentPointName.R3],
  chosenFirstAttachmentPointForBond = null,
  potentialSecondAttachmentPointForBond = null,
  monomerClass = KetMonomerClass.Base,
}: MonomerStub = {}): BaseMonomer {
  return {
    monomerItem: { props: { MonomerClass: monomerClass } },
    chosenFirstAttachmentPointForBond,
    potentialSecondAttachmentPointForBond,
    unUsedAttachmentPointsNamesList: freeAttachmentPoints,
    firstFreeAttachmentPoint: freeAttachmentPoints[0],
    isAttachmentPointExistAndFree: (attachmentPoint: AttachmentPointName) =>
      freeAttachmentPoints.includes(attachmentPoint),
  } as unknown as BaseMonomer;
}

function makeBase(options: MonomerStub = {}): RNABase {
  const stub = makeMonomer(options);
  Object.setPrototypeOf(stub, RNABase.prototype);
  return stub as RNABase;
}

describe('RNABase.getValidSourcePoint', () => {
  it('asks the user when several points are free and the partner is a phosphate (#11467)', () => {
    const base = makeBase();
    const phosphate = makeMonomer({
      monomerClass: KetMonomerClass.Phosphate,
      freeAttachmentPoints: [AttachmentPointName.R2],
      potentialSecondAttachmentPointForBond: AttachmentPointName.R2,
    });

    expect(base.getValidSourcePoint(phosphate)).toBeUndefined();
  });

  it('resolves R1 against a sugar, the default sugar R3 - base R1 bond', () => {
    const base = makeBase();
    const sugar = makeMonomer({
      monomerClass: KetMonomerClass.Sugar,
      freeAttachmentPoints: [AttachmentPointName.R3],
    });

    expect(base.getValidSourcePoint(sugar)).toBe(AttachmentPointName.R1);
  });

  it('takes the only free point without asking', () => {
    const base = makeBase({ freeAttachmentPoints: [AttachmentPointName.R3] });
    const phosphate = makeMonomer({
      monomerClass: KetMonomerClass.Phosphate,
      freeAttachmentPoints: [AttachmentPointName.R2],
      potentialSecondAttachmentPointForBond: AttachmentPointName.R2,
    });

    expect(base.getValidSourcePoint(phosphate)).toBe(AttachmentPointName.R3);
  });

  it('asks the user against a sugar when R1 is already taken', () => {
    const base = makeBase({
      freeAttachmentPoints: [AttachmentPointName.R2, AttachmentPointName.R3],
    });
    const sugar = makeMonomer({
      monomerClass: KetMonomerClass.Sugar,
      freeAttachmentPoints: [AttachmentPointName.R3],
    });

    expect(base.getValidSourcePoint(sugar)).toBeUndefined();
  });

  it('falls back to the first free point when no partner is given', () => {
    const base = makeBase();

    expect(base.getValidSourcePoint()).toBe(AttachmentPointName.R1);
  });
});
