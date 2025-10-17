import { KetMonomerClass, AttachmentPointName, AtomLabel } from 'ketcher-core';

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
    warningMessage:
      'Amino acid monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
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
    warningMessage:
      'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?',
  },
  {
    monomerType: KetMonomerClass.Base,
    requirements: [
      {
        attachmentPoint: AttachmentPointName.R1,
        expectedLeavingGroup: AtomLabel.O,
      },
    ],
    warningMessage:
      'Base monomers typically have a hydroxyl as the leaving group for R1. Do you wish to proceed with the current attachment points?',
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
    warningMessage:
      'Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?',
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
    warningMessage:
      'Nucleotide monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?',
  },
];

export const getValidationRuleForMonomerType = (
  monomerType: KetMonomerClass,
): MonomerValidationRule | undefined => {
  return MONOMER_VALIDATION_RULES.find(
    (rule) => rule.monomerType === monomerType,
  );
};
