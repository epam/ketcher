import type { KetMonomerClass } from 'application/formatters';
import type { IconName } from 'components';
import type { Editor } from '../../../../editor';
import type { Selection } from '../../../../editor/Editor';
import type { AttachmentPointName } from 'domain/types';
import type { ActionDispatch } from 'react';

export type MonomerTypeSelectItem = {
  value: KetMonomerClass | 'rnaPreset';
  label: string;
  iconName: IconName;
};

export type WizardFormFieldId =
  | 'type'
  | 'symbol'
  | 'name'
  | 'naturalAnalogue'
  | 'aliasHELM'
  | 'aliasBILN';

export type RnaPresetWizardStateFieldId =
  | 'base'
  | 'sugar'
  | 'phosphate'
  | 'preset';

export type RnaPresetWizardComponentStateFieldId = Exclude<
  RnaPresetWizardStateFieldId,
  'preset'
>;

export type StringWizardFormFieldId = Exclude<WizardFormFieldId, 'type'>;

export type WizardValues = {
  type: KetMonomerClass | 'rnaPreset' | undefined;
} & {
  [key in StringWizardFormFieldId]: string;
};

export type WizardNotificationType = 'info' | 'error' | 'warning';

export type WizardNotificationId =
  | 'defaultAttachmentPoints'
  | 'emptyMandatoryFields'
  | 'invalidSymbol'
  | 'symbolExists'
  | 'editingIsNotAllowed'
  | 'noAttachmentPoints'
  | 'incorrectAttachmentPointsOrder'
  | 'attachmentPointsNotUnique'
  | 'creationSuccessful'
  | 'creationRNASuccessful'
  | 'incontinuousStructure'
  | 'notUniqueModificationTypes'
  | 'modificationTypeExists'
  | 'notMinimalViableStructure'
  | 'impureStructure'
  | 'notUniqueHELMAlias'
  | 'invalidHELMAlias'
  | 'notUniqueBILNAlias'
  | 'invalidBILNAlias'
  | 'invalidRnaPresetStructure'
  | 'rnaPresetAtomsOutsideComponents'
  | 'rnaPresetAtomsInMultipleComponents'
  | 'rnaPresetMissingComponents'
  | 'rnaPresetInvalidSugarConnectionBonds'
  | 'rnaPresetUnexpectedBasePhosphateBond'
  | 'rnaPresetInvalidSugarBaseConnectionAttachmentPoints'
  | 'rnaPresetInvalidSugarPhosphateConnectionAttachmentPoints'
  | 'notUniquePresetCode'
  | 'invalidPresetCode'
  | 'invalidPhosphatePositionAttachmentPoints'
  | 'phosphatePositionNotSelected'
  | 'editAllPresetWarning'
  | 'editAllPresetError'
  | 'invalidName';

export type WizardNotificationTypeMap = Record<
  WizardNotificationId,
  WizardNotificationType
>;

export type WizardNotificationMessageMap = Record<WizardNotificationId, string>;

export type WizardNotification = {
  type: WizardNotificationType;
  message: string;
};

export type WizardErrors = Partial<
  Record<WizardFormFieldId | 'emptyModificationType', boolean>
>;

export type WizardNotifications = Map<WizardNotificationId, WizardNotification>;

export type WizardState = {
  values: WizardValues;
  errors: WizardErrors;
  notifications: WizardNotifications;
  structure?: Selection;
};

export type RnaPresetWizardStatePresetFieldValue = {
  name: string;
  errors: {
    name?: boolean;
    phosphatePosition?: boolean;
    components?: boolean;
  };
  notifications: WizardNotifications;
  manuallyModifiedSymbols: {
    base: boolean;
    sugar: boolean;
    phosphate: boolean;
  };
};

export type RnaPresetWizardState = {
  base: WizardState;
  sugar: WizardState;
  phosphate: WizardState;
  preset: RnaPresetWizardStatePresetFieldValue;
};

export type WizardAction =
  | { type: 'SetFieldValue'; fieldId: 'type'; value: KetMonomerClass }
  | {
      type: 'SetFieldValue';
      fieldId: StringWizardFormFieldId;
      value: string;
    }
  | {
      type: 'SetErrors';
      errors: WizardErrors;
    }
  | {
      type: 'SetNotifications';
      notifications: WizardNotifications;
    }
  | {
      type: 'AddNotification';
      id: WizardNotificationId;
    }
  | {
      type: 'RemoveNotification';
      id: WizardNotificationId;
    }
  | {
      type: 'ResetWizard';
    }
  | {
      type: 'ResetErrors';
    }
  | {
      type: 'ResetValidationNotifications';
    };

export type RnaPresetWizardAction =
  | (WizardAction & {
      rnaComponentKey: RnaPresetWizardStateFieldId;
      editor: Editor;
    })
  | {
      type: 'SetRnaPresetComponentStructure';
      rnaComponentKey: RnaPresetWizardStateFieldId;
      editor: Editor;
    }
  | {
      type: 'UpdateRnaPresetComponentStructure';
      rnaComponentKey: RnaPresetWizardComponentStateFieldId;
      atomIds: number[];
      bondIds: number[];
    }
  | {
      type: 'ResetErrors';
    }
  | {
      type: 'ResetValidationNotifications';
    }
  | {
      type: 'ResetWizard';
    }
  | {
      type: 'SetErrors';
      errors: {
        name?: boolean;
        phosphatePosition?: boolean;
        components?: boolean;
      };
      rnaComponentKey: RnaPresetWizardStateFieldId;
    }
  | {
      type: 'RemoveNotification';
      id: WizardNotificationId;
    };

export type AssignedAttachmentPointsByMonomerType = Map<
  WizardState,
  Map<AttachmentPointName, [number, number]>
>;

export function isDispatchActionForRnaPreset(
  action:
    | ActionDispatch<[WizardAction]>
    | ActionDispatch<[RnaPresetWizardAction]>,
): action is ActionDispatch<[RnaPresetWizardAction]> {
  return 'rnaComponentKey' in action;
}
