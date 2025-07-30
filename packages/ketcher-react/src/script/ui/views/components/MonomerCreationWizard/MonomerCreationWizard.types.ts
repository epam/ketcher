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

export type WizardNotification = {
  id: number;
  type: WizardNotificationType;
  message: string;
};

export type WizardState = {
  values: WizardValues;
  errors: Partial<Record<WizardFormFieldId, string>>;
  notifications: WizardNotification[];
};

export type WizardAction =
  | { type: 'SetFieldValue'; fieldId: 'type'; value: KetMonomerClass }
  | {
      type: 'SetFieldValue';
      fieldId: StringWizardFormFieldId;
      value: string;
    }
  | {
      type: 'ResetWizard';
    }
  | {
      type: 'RemoveNotification';
      id: number;
    }
  | {
      type: 'AddNotification';
      notification: WizardNotification;
    };
