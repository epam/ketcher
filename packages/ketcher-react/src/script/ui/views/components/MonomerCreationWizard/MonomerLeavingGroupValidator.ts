import { AtomLabel, AttachmentPointName, KetMonomerClass } from 'ketcher-core';
import { getValidationRuleForMonomerType } from './MonomerValidationRules';
import type { WizardNotification } from './MonomerCreationWizard.types';
import type { Editor } from 'src/script/editor/Editor';
import i18n from 'src/i18n/i18n';

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

const getLeavingAtomLabel = (
  editor: Editor,
  assignedAttachmentPoints:
    Map<AttachmentPointName, [number, number]> | undefined,
  attachmentPointName: AttachmentPointName,
): string | undefined => {
  const leavingAtomId = assignedAttachmentPoints?.get(attachmentPointName)?.[1];

  if (leavingAtomId === undefined) {
    return undefined;
  }

  return editor.struct().atoms.get(leavingAtomId)?.label;
};

export const getRnaPresetLeavingGroupWarningMessage = (
  editor: Editor,
  sugarAttachmentPoints?: Map<AttachmentPointName, [number, number]>,
  phosphateAttachmentPoints?: Map<AttachmentPointName, [number, number]>,
): string | null => {
  const sugarR1LeavingGroup = getLeavingAtomLabel(
    editor,
    sugarAttachmentPoints,
    AttachmentPointName.R1,
  );
  const phosphateR2LeavingGroup = getLeavingAtomLabel(
    editor,
    phosphateAttachmentPoints,
    AttachmentPointName.R2,
  );
  const hasSugarWarning =
    sugarR1LeavingGroup !== undefined && sugarR1LeavingGroup !== AtomLabel.H;
  const hasPhosphateWarning =
    phosphateR2LeavingGroup !== undefined &&
    phosphateR2LeavingGroup !== AtomLabel.O;

  if (hasSugarWarning && hasPhosphateWarning) {
    return i18n.t(
      'components:monomerCreationWizard.notifications.sugarPhosphateLeavingGroupWarning',
    );
  }

  if (hasSugarWarning) {
    return i18n.t(
      'components:monomerCreationWizard.notifications.sugarLeavingGroupWarning',
    );
  }

  if (hasPhosphateWarning) {
    return i18n.t(
      'components:monomerCreationWizard.notifications.phosphateLeavingGroupWarning',
    );
  }

  return null;
};
