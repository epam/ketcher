import { KetMonomerClass } from 'application/formatters';
import { IconName } from 'components';

export type MonomerTypeSelectItem = {
  value: KetMonomerClass;
  label: string;
  iconName: IconName;
};

export type WizardFormFieldId = 'type' | 'symbol' | 'name' | 'naturalAnalogue';

export type StringWizardFormFieldId = Exclude<WizardFormFieldId, 'type'>;

export type WizardValues = {
  type: KetMonomerClass | undefined;
} & {
  [key in StringWizardFormFieldId]: string;
};

export type WizardNotificationType = 'info' | 'error';

export type WizardNotificationId =
  | 'defaultAttachmentPoints'
  | 'emptyMandatoryFields'
  | 'invalidSymbol'
  | 'symbolExists';

export type WizardNotificationMessageMap = Record<WizardNotificationId, string>;

export type WizardNotification = {
  type: WizardNotificationType;
  message: string;
};

export type WizardErrors = Partial<Record<WizardFormFieldId, boolean>>;

export type WizardNotifications = Map<WizardNotificationId, WizardNotification>;

export type WizardState = {
  values: WizardValues;
  errors: WizardErrors;
  notifications: WizardNotifications;
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
      type: 'RemoveNotification';
      id: WizardNotificationId;
    }
  | {
      type: 'ResetWizard';
    }
  | {
      type: 'ResetErrors';
    };
