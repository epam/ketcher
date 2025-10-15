import { KetMonomerClass } from 'ketcher-core';

export type LeavingGroupRequirement = {
  attachmentPoint: string;
  expectedLeavingGroup: string;
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
        attachmentPoint: 'R1',
        expectedLeavingGroup: 'H',
      },
      { attachmentPoint: 'R2', expectedLeavingGroup: 'O' },
    ],
    warningMessage:
      'Amino acid monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?" with options "Cancel" (default) and "Yes" and a title "Non-typical attachment points.',
  },
  {
    monomerType: KetMonomerClass.Sugar,
    requirements: [
      { attachmentPoint: 'R1', expectedLeavingGroup: 'H' },
      { attachmentPoint: 'R2', expectedLeavingGroup: 'H' },
      { attachmentPoint: 'R3', expectedLeavingGroup: 'O' },
    ],
    warningMessage:
      'Sugar monomers typically have a hydrogen as the leaving group for R1 and R2, and a hydroxyl as a leaving group for R3. Do you wish to proceed with the current attachment points?" with options "Cancel" (default) and "Yes" and a title "Non-typical attachment points.',
  },
  {
    monomerType: KetMonomerClass.Base,
    requirements: [{ attachmentPoint: 'R1', expectedLeavingGroup: 'O' }],
    warningMessage:
      'Base monomers typically have a hydroxyl as the leaving group for R1. Do you wish to proceed with the current attachment points?" with options "Cancel" (default) and "Yes" and a title "Non-typical attachment points.',
  },
  {
    monomerType: KetMonomerClass.Phosphate,
    requirements: [
      {
        attachmentPoint: 'R1',
        expectedLeavingGroup: 'O',
      },
      {
        attachmentPoint: 'R2',
        expectedLeavingGroup: 'O',
      },
    ],
    warningMessage:
      'Phosphate monomers typically have a hydroxyl as the leaving group for R1 and R2. Do you wish to proceed with the current attachment points?" with options "Cancel" (default) and "Yes" and a title "Non-typical attachment points.',
  },
  {
    monomerType: KetMonomerClass.RNA,
    requirements: [
      { attachmentPoint: 'R1', expectedLeavingGroup: 'H' },
      { attachmentPoint: 'R2', expectedLeavingGroup: 'O' },
    ],
    warningMessage:
      'Nucleotide monomers typically have a hydrogen as the leaving group for R1, and a hydroxyl as a leaving group for R2. Do you wish to proceed with the current attachment points?" with options "Cancel" (default) and "Yes" and a title "Non-typical attachment points.',
  },
];

export const getValidationRuleForMonomerType = (
  monomerType: KetMonomerClass,
): MonomerValidationRule | undefined => {
  return MONOMER_VALIDATION_RULES.find(
    (rule) => rule.monomerType === monomerType,
  );
};
