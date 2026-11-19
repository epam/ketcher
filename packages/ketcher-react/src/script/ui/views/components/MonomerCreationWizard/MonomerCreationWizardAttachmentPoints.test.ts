import { AttachmentPointName } from 'ketcher-core';
import {
  computeFinalApNames,
  hasDuplicateApNames,
} from './MonomerCreationWizardAttachmentPoints';

describe('hasDuplicateApNames', () => {
  it('returns false for an empty list', () => {
    expect(hasDuplicateApNames([])).toBe(false);
  });

  it('returns false when all names are unique', () => {
    expect(
      hasDuplicateApNames([
        AttachmentPointName.R1,
        AttachmentPointName.R2,
        AttachmentPointName.R3,
      ]),
    ).toBe(false);
  });

  it('returns true when two names are the same', () => {
    expect(
      hasDuplicateApNames([AttachmentPointName.R1, AttachmentPointName.R1]),
    ).toBe(true);
  });

  it('returns true when only one of three names is duplicated', () => {
    expect(
      hasDuplicateApNames([
        AttachmentPointName.R1,
        AttachmentPointName.R2,
        AttachmentPointName.R1,
      ]),
    ).toBe(true);
  });
});

describe('computeFinalApNames', () => {
  it('returns original names when there are no pending renames', () => {
    expect(
      computeFinalApNames(
        [AttachmentPointName.R1, AttachmentPointName.R2],
        new Map(),
      ),
    ).toEqual([AttachmentPointName.R1, AttachmentPointName.R2]);
  });

  it('applies a pending rename for one AP', () => {
    expect(
      computeFinalApNames(
        [AttachmentPointName.R1, AttachmentPointName.R2],
        new Map([[AttachmentPointName.R2, AttachmentPointName.R3]]),
      ),
    ).toEqual([AttachmentPointName.R1, AttachmentPointName.R3]);
  });

  it('detects a duplicate when two APs end up with the same pending name', () => {
    const finalNames = computeFinalApNames(
      [AttachmentPointName.R1, AttachmentPointName.R2],
      new Map([[AttachmentPointName.R2, AttachmentPointName.R1]]),
    );
    expect(hasDuplicateApNames(finalNames)).toBe(true);
  });

  it('allows a valid swap where both APs are renamed to each other', () => {
    const finalNames = computeFinalApNames(
      [AttachmentPointName.R1, AttachmentPointName.R2],
      new Map([
        [AttachmentPointName.R1, AttachmentPointName.R2],
        [AttachmentPointName.R2, AttachmentPointName.R1],
      ]),
    );
    expect(hasDuplicateApNames(finalNames)).toBe(false);
    expect(finalNames).toEqual([
      AttachmentPointName.R2,
      AttachmentPointName.R1,
    ]);
  });
});
