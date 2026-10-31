import { AtomLabel, AttachmentPointName } from 'ketcher-core';
import i18n from 'src/i18n/i18n';
import type { Editor } from 'src/script/editor/Editor';
import { getRnaPresetLeavingGroupWarningMessage } from './MonomerLeavingGroupValidator';

type AttachmentPointMap = Map<AttachmentPointName, [number, number]>;

const createEditor = (leavingAtomLabels: Map<number, AtomLabel>) =>
  ({
    struct: () => ({
      atoms: new Map(
        Array.from(leavingAtomLabels, ([id, label]) => [id, { label }]),
      ),
    }),
  }) as unknown as Editor;

const sugarMessageKey =
  'components:monomerCreationWizard.notifications.sugarLeavingGroupWarning';
const phosphateMessageKey =
  'components:monomerCreationWizard.notifications.phosphateLeavingGroupWarning';
const sugarPhosphateMessageKey =
  'components:monomerCreationWizard.notifications.sugarPhosphateLeavingGroupWarning';

describe('getRnaPresetLeavingGroupWarningMessage', () => {
  it.each<{
    name: string;
    sugarLeavingGroup?: AtomLabel;
    phosphateLeavingGroup?: AtomLabel;
    expectedMessageKey: string | null;
  }>([
    {
      name: 'no warning when sugar R1 is H and phosphate R2 is O',
      sugarLeavingGroup: AtomLabel.H,
      phosphateLeavingGroup: AtomLabel.O,
      expectedMessageKey: null,
    },
    {
      name: 'sugar warning when sugar R1 is not H',
      sugarLeavingGroup: AtomLabel.O,
      phosphateLeavingGroup: AtomLabel.O,
      expectedMessageKey: sugarMessageKey,
    },
    {
      name: 'phosphate warning when phosphate R2 is not O',
      sugarLeavingGroup: AtomLabel.H,
      phosphateLeavingGroup: AtomLabel.H,
      expectedMessageKey: phosphateMessageKey,
    },
    {
      name: 'combined warning when both sugar R1 and phosphate R2 differ',
      sugarLeavingGroup: AtomLabel.O,
      phosphateLeavingGroup: AtomLabel.H,
      expectedMessageKey: sugarPhosphateMessageKey,
    },
    {
      name: 'sugar warning when phosphate components are absent',
      sugarLeavingGroup: AtomLabel.O,
      phosphateLeavingGroup: undefined,
      expectedMessageKey: sugarMessageKey,
    },
  ])(
    '$name',
    ({ sugarLeavingGroup, phosphateLeavingGroup, expectedMessageKey }) => {
      const leavingAtomLabels = new Map<number, AtomLabel>();
      const sugarAttachmentPoints: AttachmentPointMap | undefined =
        sugarLeavingGroup === undefined
          ? undefined
          : new Map([[AttachmentPointName.R1, [1, 11]]]);
      const phosphateAttachmentPoints: AttachmentPointMap | undefined =
        phosphateLeavingGroup === undefined
          ? undefined
          : new Map([[AttachmentPointName.R2, [2, 22]]]);

      if (sugarLeavingGroup !== undefined) {
        leavingAtomLabels.set(11, sugarLeavingGroup);
      }
      if (phosphateLeavingGroup !== undefined) {
        leavingAtomLabels.set(22, phosphateLeavingGroup);
      }

      const message = getRnaPresetLeavingGroupWarningMessage(
        createEditor(leavingAtomLabels),
        sugarAttachmentPoints,
        phosphateAttachmentPoints,
      );

      expect(message).toBe(
        expectedMessageKey === null ? null : i18n.t(expectedMessageKey),
      );
    },
  );

  it('returns null when preset components have no attachment points', () => {
    expect(
      getRnaPresetLeavingGroupWarningMessage(createEditor(new Map())),
    ).toBeNull();
  });

  it('ignores sugar R1 attachment points on a different AP name', () => {
    const sugarAttachmentPoints: AttachmentPointMap = new Map([
      [AttachmentPointName.R2, [1, 11]],
    ]);

    expect(
      getRnaPresetLeavingGroupWarningMessage(
        createEditor(new Map([[11, AtomLabel.O]])),
        sugarAttachmentPoints,
      ),
    ).toBeNull();
  });

  it('ignores attachment points whose leaving atom is missing from the structure', () => {
    const sugarAttachmentPoints: AttachmentPointMap = new Map([
      [AttachmentPointName.R1, [1, 11]],
    ]);

    expect(
      getRnaPresetLeavingGroupWarningMessage(
        createEditor(new Map()),
        sugarAttachmentPoints,
      ),
    ).toBeNull();
  });
});
