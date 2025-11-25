import { KetMonomerClass } from 'application/formatters';
import { IconName } from 'components';
import { Editor } from '../../../../editor';
import { Selection } from '../../../../editor/Editor';
import { AttachmentPointName } from 'domain/types';
import { ActionDispatch } from 'react';

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
  | 'aliasHELM';

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
  | 'creationSuccessful'
  | 'incontinuousStructure'
  | 'notUniqueModificationTypes'
  | 'modificationTypeExists'
  | 'notMinimalViableStructure'
  | 'impureStructure'
  | 'notUniqueHELMAlias'
  | 'invalidHELMAlias'
  | 'invalidRnaPresetStructure';

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
  };
  notifications: WizardNotifications;
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
      type: 'ResetErrors';
    }
  | {
      type: 'SetErrors';
      errors: {
        name?: boolean;
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
