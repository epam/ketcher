import { KetMonomerClass, AttachmentPointName, AtomLabel } from 'ketcher-core';
import i18n from 'src/i18n/i18n';

export type LeavingGroupRequirement = {
  attachmentPoint: AttachmentPointName;
  expectedLeavingGroup: AtomLabel;
};

export type MonomerValidationRule = {
  monomerType: KetMonomerClass;
  requirements: LeavingGroupRequirement[];
  warningMessage: string;
};

export const MONOMER_VALIDATION_RULES: MonomerValidationRule[] = [
  {
    monomerType: KetMonomerClass.AminoAcid,
    requirements: [
      {
        attachmentPoint: AttachmentPointName.R1,
        expectedLeavingGroup: AtomLabel.H,
      },
      {
        attachmentPoint: AttachmentPointName.R2,
        expectedLeavingGroup: AtomLabel.O,
      },
    ],
    warningMessage: i18n.t(
      'components:monomerCreationWizard.notifications.aminoAcidLeavingGroupWarning',
    ),
  },
  {
    monomerType: KetMonomerClass.Sugar,
    requirements: [
      {
        attachmentPoint: AttachmentPointName.R1,
        expectedLeavingGroup: AtomLabel.H,
      },
      {
        attachmentPoint: AttachmentPointName.R2,
        expectedLeavingGroup: AtomLabel.H,
      },
      {
        attachmentPoint: AttachmentPointName.R3,
        expectedLeavingGroup: AtomLabel.O,
      },
    ],
    warningMessage: i18n.t(
      'components:monomerCreationWizard.notifications.sugarLeavingGroupWarning',
    ),
  },
  {
    monomerType: KetMonomerClass.Base,
    requirements: [
      {
        attachmentPoint: AttachmentPointName.R1,
        expectedLeavingGroup: AtomLabel.H,
      },
    ],
    warningMessage: i18n.t(
      'components:monomerCreationWizard.notifications.baseLeavingGroupWarning',
    ),
  },
  {
    monomerType: KetMonomerClass.Phosphate,
    requirements: [
      {
        attachmentPoint: AttachmentPointName.R1,
        expectedLeavingGroup: AtomLabel.O,
      },
      {
        attachmentPoint: AttachmentPointName.R2,
        expectedLeavingGroup: AtomLabel.O,
      },
    ],
    warningMessage: i18n.t(
      'components:monomerCreationWizard.notifications.phosphateLeavingGroupWarning',
    ),
  },
  {
    monomerType: KetMonomerClass.RNA,
    requirements: [
      {
        attachmentPoint: AttachmentPointName.R1,
        expectedLeavingGroup: AtomLabel.H,
      },
      {
        attachmentPoint: AttachmentPointName.R2,
        expectedLeavingGroup: AtomLabel.O,
      },
    ],
    warningMessage: i18n.t(
      'components:monomerCreationWizard.notifications.nucleotideLeavingGroupWarning',
    ),
  },
];

export const getValidationRuleForMonomerType = (
  monomerType: KetMonomerClass | 'rnaPreset',
): MonomerValidationRule | undefined => {
  return MONOMER_VALIDATION_RULES.find(
    (rule) => rule.monomerType === monomerType,
  );
};
