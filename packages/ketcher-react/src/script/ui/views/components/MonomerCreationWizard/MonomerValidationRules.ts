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

// Validation rules for individual monomers
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

// Specific validation rules for RNA preset components (only the critical ones for the preset)
export const RNA_PRESET_SUGAR_R1_RULE: LeavingGroupRequirement = {
  attachmentPoint: AttachmentPointName.R1,
  expectedLeavingGroup: AtomLabel.H,
};

export const RNA_PRESET_PHOSPHATE_R2_RULE: LeavingGroupRequirement = {
  attachmentPoint: AttachmentPointName.R2,
  expectedLeavingGroup: AtomLabel.O,
};

export const RNA_PRESET_SUGAR_WARNING =
  'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?';

export const RNA_PRESET_PHOSPHATE_WARNING =
  'Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?';

export const RNA_PRESET_COMBINED_WARNING =
  'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?';

export const getValidationRuleForMonomerType = (
  monomerType: KetMonomerClass | 'rnaPreset',
): MonomerValidationRule | undefined => {
  return MONOMER_VALIDATION_RULES.find(
    (rule) => rule.monomerType === monomerType,
  );
};
