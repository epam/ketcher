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
// These rules are used to validate leaving groups when creating RNA presets.
// Per requirements 2.4.2 and 2.4.3: only sugar R1 and phosphate R2 are validated for presets.

// For RNA presets: Sugar R1 should have H as leaving group (requirement 2.4.2)
export const RNA_PRESET_SUGAR_R1_RULE: LeavingGroupRequirement = {
  attachmentPoint: AttachmentPointName.R1,
  expectedLeavingGroup: AtomLabel.H,
};

// For RNA presets: Phosphate R2 should have OH (represented as O) as leaving group (requirement 2.4.3)
export const RNA_PRESET_PHOSPHATE_R2_RULE: LeavingGroupRequirement = {
  attachmentPoint: AttachmentPointName.R2,
  expectedLeavingGroup: AtomLabel.O,
};

// Warning messages for RNA preset leaving group validation
// Note: Full sugar warning message is shown even though only R1 is validated for presets
export const RNA_PRESET_SUGAR_WARNING =
  'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?';

// Note: Full phosphate warning message is shown even though only R2 is validated for presets
export const RNA_PRESET_PHOSPHATE_WARNING =
  'Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?';

// Combined warning when both sugar R1 and phosphate R2 have invalid leaving groups (requirement 2.4.4)
export const RNA_PRESET_COMBINED_WARNING =
  'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?';

export const getValidationRuleForMonomerType = (
  monomerType: KetMonomerClass | 'rnaPreset',
): MonomerValidationRule | undefined => {
  return MONOMER_VALIDATION_RULES.find(
    (rule) => rule.monomerType === monomerType,
  );
};
