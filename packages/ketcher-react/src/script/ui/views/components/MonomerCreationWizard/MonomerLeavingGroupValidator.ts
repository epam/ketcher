import { KetMonomerClass, AttachmentPointName } from 'ketcher-core';
import { getValidationRuleForMonomerType } from './MonomerValidationRules';
import { WizardNotification } from './MonomerCreationWizard.types';
import { Editor } from 'src/script/editor/Editor';

const getNotificationIdForMonomerType = (
  monomerType: KetMonomerClass,
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
  monomerType: KetMonomerClass,
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
      requirement.attachmentPoint as AttachmentPointName,
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
