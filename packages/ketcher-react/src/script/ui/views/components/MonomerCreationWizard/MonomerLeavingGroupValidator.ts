import { KetMonomerClass, AttachmentPointName } from 'ketcher-core';
import {
  getValidationRuleForMonomerType,
  RNA_PRESET_SUGAR_R1_RULE,
  RNA_PRESET_PHOSPHATE_R2_RULE,
  RNA_PRESET_SUGAR_WARNING,
  RNA_PRESET_PHOSPHATE_WARNING,
  RNA_PRESET_COMBINED_WARNING,
} from './MonomerValidationRules';
import { WizardNotification } from './MonomerCreationWizard.types';
import { Editor } from 'src/script/editor/Editor';

const getNotificationIdForMonomerType = (
  monomerType: KetMonomerClass | 'rnaPreset',
): string => {
  switch (monomerType) {
    case KetMonomerClass.AminoAcid:
      return 'aminoAcidLeavingGroupWarning';
    case KetMonomerClass.Sugar:
      return 'sugarLeavingGroupWarning';
    case KetMonomerClass.Base:
      return 'baseLeavingGroupWarning';
    case KetMonomerClass.Phosphate:
      return 'phosphateLeavingGroupWarning';
    case KetMonomerClass.RNA:
      return 'nucleotideLeavingGroupWarning';
    default:
      return 'nucleotideLeavingGroupWarning';
  }
};

export const validateMonomerLeavingGroups = (
  editor: Editor,
  monomerType: KetMonomerClass | 'rnaPreset',
  assignedAttachmentPoints: Map<AttachmentPointName, [number, number]>,
): Map<string, WizardNotification> => {
  const notifications = new Map<string, WizardNotification>();
  const validationRule = getValidationRuleForMonomerType(monomerType);

  if (!validationRule) {
    return notifications;
  }

  const struct = editor.struct();
  let hasWarning = false;

  for (const requirement of validationRule.requirements) {
    const attachmentPoint = assignedAttachmentPoints.get(
      requirement.attachmentPoint,
    );

    if (attachmentPoint) {
      const [, leavingAtomId] = attachmentPoint;
      const leavingAtom = struct.atoms.get(leavingAtomId);

      if (
        leavingAtom &&
        leavingAtom.label !== requirement.expectedLeavingGroup
      ) {
        hasWarning = true;
        break;
      }
    }
  }

  if (hasWarning) {
    const notificationId = getNotificationIdForMonomerType(monomerType);
    notifications.set(notificationId, {
      type: 'warning',
      message: validationRule.warningMessage,
    });
  }

  return notifications;
};

/**
 * Validates leaving groups for RNA preset components (sugar and phosphate)
 * Returns a combined warning message if both sugar R1 and phosphate R2 have invalid LGAs
 */
export const validateRnaPresetLeavingGroups = (
  editor: Editor,
  sugarAttachmentPoints: Map<AttachmentPointName, [number, number]>,
  phosphateAttachmentPoints: Map<AttachmentPointName, [number, number]>,
): Map<string, WizardNotification> => {
  const notifications = new Map<string, WizardNotification>();
  const struct = editor.struct();

  let hasSugarWarning = false;
  let hasPhosphateWarning = false;

  // Check sugar R1 - should have H as leaving group
  const sugarR1 = sugarAttachmentPoints.get(
    RNA_PRESET_SUGAR_R1_RULE.attachmentPoint,
  );
  if (sugarR1) {
    const [, leavingAtomId] = sugarR1;
    const leavingAtom = struct.atoms.get(leavingAtomId);
    if (
      leavingAtom &&
      leavingAtom.label !== RNA_PRESET_SUGAR_R1_RULE.expectedLeavingGroup
    ) {
      hasSugarWarning = true;
    }
  }

  // Check phosphate R2 - should have OH (O) as leaving group
  // Note: 'O' represents hydroxyl (OH) in atom labels since H is implicit in chemistry notation
  const phosphateR2 = phosphateAttachmentPoints.get(
    RNA_PRESET_PHOSPHATE_R2_RULE.attachmentPoint,
  );
  if (phosphateR2) {
    const [, leavingAtomId] = phosphateR2;
    const leavingAtom = struct.atoms.get(leavingAtomId);
    if (
      leavingAtom &&
      leavingAtom.label !== RNA_PRESET_PHOSPHATE_R2_RULE.expectedLeavingGroup
    ) {
      hasPhosphateWarning = true;
    }
  }

  // Determine which warning message to show
  if (hasSugarWarning && hasPhosphateWarning) {
    // Combined warning for both sugar and phosphate
    notifications.set('rnaPresetLeavingGroupWarning', {
      type: 'warning',
      message: RNA_PRESET_COMBINED_WARNING,
    });
  } else if (hasSugarWarning) {
    // Sugar-only warning
    notifications.set('rnaPresetLeavingGroupWarning', {
      type: 'warning',
      message: RNA_PRESET_SUGAR_WARNING,
    });
  } else if (hasPhosphateWarning) {
    // Phosphate-only warning
    notifications.set('rnaPresetLeavingGroupWarning', {
      type: 'warning',
      message: RNA_PRESET_PHOSPHATE_WARNING,
    });
  }

  return notifications;
};
