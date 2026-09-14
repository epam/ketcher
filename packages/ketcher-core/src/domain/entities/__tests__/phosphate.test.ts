/**
 * Unit tests for Phosphate.getValidSourcePoint.
 *
 * The method decides whether a bond can be resolved without asking the user:
 * returning an attachment point creates the bond straight away, while
 * returning undefined makes the caller open the "Select Attachment Points"
 * dialog (see LibraryItemDragDropHandler).
 *
 * Two requirements meet here and must stay separated:
 *   - #3808  two free phosphates connected centre-to-centre can bond R2-R1,
 *            R1-R1 or R2-R2, so the user has to choose.
 *   - #11466 dropping a phosphate onto one specific free attachment point
 *            leaves a single possible bond, so no dialog.
 *
 * What tells them apart is whether an attachment point has been chosen on the
 * other monomer. Only stub the properties the method actually reads.
 */
import { Phosphate } from 'domain/entities/Phosphate';
import type { BaseMonomer } from 'domain/entities/BaseMonomer';
import { AttachmentPointName } from 'domain/types';
import { KetMonomerClass } from 'application/formatters';

type MonomerStub = {
  freeAttachmentPoints?: AttachmentPointName[];
  potentialSecondAttachmentPointForBond?: AttachmentPointName | null;
  chosenFirstAttachmentPointForBond?: AttachmentPointName | null;
  monomerClass?: KetMonomerClass;
};

function makeMonomer({
  freeAttachmentPoints = [AttachmentPointName.R1, AttachmentPointName.R2],
  potentialSecondAttachmentPointForBond = null,
  chosenFirstAttachmentPointForBond = null,
  monomerClass = KetMonomerClass.Phosphate,
}: MonomerStub = {}): BaseMonomer {
  return {
    monomerItem: { props: { MonomerClass: monomerClass } },
    chosenFirstAttachmentPointForBond,
    potentialSecondAttachmentPointForBond,
    unUsedAttachmentPointsNamesList: freeAttachmentPoints,
    isAttachmentPointExistAndFree: (attachmentPoint: AttachmentPointName) =>
      freeAttachmentPoints.includes(attachmentPoint),
  } as unknown as BaseMonomer;
}

function makePhosphate(options: MonomerStub = {}): Phosphate {
  const stub = makeMonomer(options);
  Object.setPrototypeOf(stub, Phosphate.prototype);
  return stub as Phosphate;
}

describe('Phosphate.getValidSourcePoint', () => {
  it('resolves R1 when the other phosphate already has R2 chosen (#11466)', () => {
    const droppedPhosphate = makePhosphate();
    const presetPhosphate = makeMonomer({
      freeAttachmentPoints: [AttachmentPointName.R2],
      potentialSecondAttachmentPointForBond: AttachmentPointName.R2,
    });

    expect(droppedPhosphate.getValidSourcePoint(presetPhosphate)).toBe(
      AttachmentPointName.R1,
    );
  });

  it('still asks the user for two free phosphates with no chosen point (#3808)', () => {
    const leftPhosphate = makePhosphate();
    const rightPhosphate = makeMonomer();

    expect(leftPhosphate.getValidSourcePoint(rightPhosphate)).toBeUndefined();
  });

  it('resolves R1 against a sugar with a free R2, as before', () => {
    const phosphate = makePhosphate();
    const sugar = makeMonomer({
      monomerClass: KetMonomerClass.Sugar,
      freeAttachmentPoints: [AttachmentPointName.R2],
    });

    expect(phosphate.getValidSourcePoint(sugar)).toBe(AttachmentPointName.R1);
  });

  it('asks the user when the chosen point on the other monomer has no counterpart', () => {
    const phosphate = makePhosphate({
      freeAttachmentPoints: [AttachmentPointName.R2, AttachmentPointName.R3],
    });
    const otherPhosphate = makeMonomer({
      freeAttachmentPoints: [AttachmentPointName.R2],
      potentialSecondAttachmentPointForBond: AttachmentPointName.R2,
    });

    expect(phosphate.getValidSourcePoint(otherPhosphate)).toBeUndefined();
  });
});
