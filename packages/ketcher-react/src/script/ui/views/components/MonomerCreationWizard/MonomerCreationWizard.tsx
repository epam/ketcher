import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon } from 'components';
import {
  CoreEditor,
  CREATE_MONOMER_TOOL_NAME,
  KetMonomerClass,
} from 'ketcher-core';
import Select from '../../../component/form/Select';
import { ChangeEvent, useEffect, useMemo, useReducer } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker, {
  isNaturalAnalogueRequired,
} from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useDispatch, useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import {
  closeMonomerCreationWizard,
  submitMonomerCreation,
} from '../../../state/editor/actions/monomerCreation';
import AttributeField from './components/AttributeField/AttributeField';
import Notification from './components/Notification/Notification';
import {
  WizardAction,
  WizardFormFieldId,
  WizardNotification,
  WizardNotificationId,
  WizardState,
  WizardValues,
} from './MonomerCreationWizard.types';
import {
  MonomerCreationExternalNotificationAction,
  MonomerTypeSelectConfig,
  NotificationMessages,
  NotificationTypes,
} from './MonomerCreationWizard.constants';

const initialWizardState: WizardState = {
  values: {
    type: undefined,
    symbol: '',
    name: '',
    naturalAnalogue: '',
  },
  errors: {},
  notifications: new Map([
    [
      'defaultAttachmentPoints',
      { type: 'info', message: NotificationMessages.defaultAttachmentPoints },
    ],
  ]),
};

const wizardReducer = (
  state: WizardState,
  action: WizardAction,
): WizardState => {
  switch (action.type) {
    case 'SetFieldValue': {
      const { fieldId, value } = action;

      const values = {
        ...state.values,
        [fieldId]: value,
      };

      if (fieldId === 'type') {
        values.naturalAnalogue = '';
      }

      return {
        ...state,
        values,
        errors: {
          ...state.errors,
          [fieldId]: undefined,
        },
      };
    }

    case 'SetErrors': {
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.errors,
        },
      };
    }

    case 'SetNotifications': {
      return {
        ...state,
        notifications: new Map([
          ...state.notifications,
          ...action.notifications,
        ]),
      };
    }

    case 'AddNotification': {
      const notifications = new Map(state.notifications);
      const { id } = action;
      if (!notifications.has(id)) {
        notifications.set(id, {
          type: NotificationTypes[id],
          message: NotificationMessages[id],
        });
      }

      return {
        ...state,
        notifications,
      };
    }

    case 'ResetErrors': {
      return {
        ...state,
        errors: {},
      };
    }

    case 'ResetWizard': {
      return initialWizardState;
    }

    case 'RemoveNotification': {
      const notifications = new Map(state.notifications);
      notifications.delete(action.id);

      return {
        ...state,
        notifications,
      };
    }

    default:
      return state;
  }
};

const validateInputs = (values: WizardValues) => {
  const errors: Partial<Record<WizardFormFieldId, boolean>> = {};
  const notifications = new Map<WizardNotificationId, WizardNotification>();

  Object.entries(values).forEach(([key, value]) => {
    if (!value?.trim()) {
      if (key !== 'naturalAnalogue' || isNaturalAnalogueRequired(values.type)) {
        errors[key as WizardFormFieldId] = true;
        notifications.set('emptyMandatoryFields', {
          type: 'error',
          message: NotificationMessages.emptyMandatoryFields,
        });
      }
      return;
    }

    if (key === 'symbol') {
      const symbolRegex = /^[a-zA-Z0-9-_*]*$/;
      if (!symbolRegex.test(value)) {
        errors[key as WizardFormFieldId] = true;
        notifications.set('invalidSymbol', {
          type: 'error',
          message: NotificationMessages.invalidSymbol,
        });
        return;
      }

      const editor = CoreEditor.provideEditorInstance();
      if (editor.checkIfMonomerSymbolExists(value)) {
        errors[key as WizardFormFieldId] = true;
        notifications.set('symbolExists', {
          type: 'error',
          message: NotificationMessages.symbolExists,
        });
      }
    }
  });

  return { errors, notifications };
};

const MonomerCreationWizard = () => {
  const reduxDispatch = useDispatch();
  const [wizardState, wizardStateDispatch] = useReducer(
    wizardReducer,
    initialWizardState,
  );

  const { values, notifications, errors } = wizardState;
  const { type, symbol, name, naturalAnalogue } = values;

  useEffect(() => {
    const externalNotificationEventListener = (event: Event) => {
      const notificationId = (event as CustomEvent<WizardNotificationId>)
        .detail;
      if (notificationId) {
        wizardStateDispatch({ type: 'AddNotification', id: notificationId });
      }
    };

    window.addEventListener(
      MonomerCreationExternalNotificationAction,
      externalNotificationEventListener,
    );

    return () => {
      window.removeEventListener(
        MonomerCreationExternalNotificationAction,
        externalNotificationEventListener,
      );
    };
  }, []);

  const handleFieldChange = (
    fieldId: WizardFormFieldId,
    value: KetMonomerClass | string,
  ) => {
    if (fieldId === 'type') {
      wizardStateDispatch({
        type: 'SetFieldValue',
        fieldId: 'type',
        value: value as KetMonomerClass,
      });
    } else {
      wizardStateDispatch({
        type: 'SetFieldValue',
        fieldId,
        value,
      });
    }
  };

  const monomerTypeSelectOptions = useMemo(
    () =>
      MonomerTypeSelectConfig.map((option) => ({
        ...option,
        children: (
          <div className={styles.typeOption}>
            <Icon name={option.iconName} />
            {option.label}
          </div>
        ),
      })),
    [],
  );

  const resetWizard = () => {
    wizardStateDispatch({ type: 'ResetWizard' });
  };

  const handleDiscard = () => {
    reduxDispatch(closeMonomerCreationWizard());
    resetWizard();
  };

  const handleSubmit = () => {
    wizardStateDispatch({ type: 'ResetErrors' });

    const { errors, notifications } = validateInputs(values);
    if (Object.keys(errors).length > 0) {
      wizardStateDispatch({ type: 'SetErrors', errors });
      wizardStateDispatch({ type: 'SetNotifications', notifications });
      return;
    }

    reduxDispatch(
      submitMonomerCreation({
        type,
        symbol,
        name,
        naturalAnalogue,
      }),
    );
    resetWizard();
  };

  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);

  if (!monomerCreationState) {
    return null;
  }

  const { attachmentAtomIdToLeavingAtomId } = monomerCreationState;

  return (
    <div className={styles.monomerCreationWizard}>
      <div className={styles.leftColumn}>
        <p className={styles.wizardTitle}>
          <Icon name={CREATE_MONOMER_TOOL_NAME} />
          Create Monomer
        </p>

        <div className={styles.notificationsArea}>
          {Array.from(notifications.entries()).map(
            ([id, { type, message }]) => (
              <Notification
                id={id}
                type={type}
                message={message}
                key={id}
                wizardStateDispatch={wizardStateDispatch}
              />
            ),
          )}
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div
          className={clsx(
            selectStyles.selectContainer,
            styles.attributesWindow,
          )}
        >
          <p className={styles.attributesTitle}>Attributes</p>
          <div className={styles.attributesFields}>
            <AttributeField
              title="Type"
              control={
                <Select
                  className={clsx(styles.input, errors.type && styles.error)}
                  options={monomerTypeSelectOptions}
                  placeholder="Select monomer type"
                  value={type}
                  onChange={(value) => handleFieldChange('type', value)}
                />
              }
              required
            />
            <AttributeField
              title="Symbol"
              control={
                <input
                  type="text"
                  className={clsx(styles.input, errors.symbol && styles.error)}
                  placeholder="ex.: Azs980uX"
                  value={symbol}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleFieldChange('symbol', event.target.value)
                  }
                />
              }
              required
            />
            <AttributeField
              title="Name"
              control={
                <input
                  type="text"
                  className={clsx(styles.input, errors.name && styles.error)}
                  placeholder="ex.: 5-hydroxymethyl dC-12"
                  value={name}
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleFieldChange('name', event.target.value)
                  }
                />
              }
              required
            />
            <AttributeField
              title="Natural analogue"
              control={
                <NaturalAnaloguePicker
                  className={clsx(errors.type && styles.error)}
                  monomerType={type}
                  value={naturalAnalogue}
                  onChange={(value) =>
                    handleFieldChange('naturalAnalogue', value)
                  }
                />
              }
              disabled={!isNaturalAnalogueRequired(type)}
              required
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.attributesFields}>
            <p className={styles.attachmentPointsTitle}>Attachment points</p>
            <div className={styles.attachmentPoints}>
              {[...attachmentAtomIdToLeavingAtomId.entries()].map(
                ([attachmentAtomId, leavingAtomId], index) => (
                  <div
                    className={styles.attachmentPoint}
                    key={`${attachmentAtomId}-${leavingAtomId}`}
                  >
                    <p className={styles.attachmentPointText}>
                      <span className={styles.attachmentPointIndex}>
                        R{index + 1}
                      </span>
                      &nbsp;(H)
                    </p>
                    <Icon name="close" className={styles.attachmentPointIcon} />
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className={styles.buttonsContainer}>
          <button className={styles.buttonDiscard} onClick={handleDiscard}>
            Discard
          </button>
          <button className={styles.buttonSubmit} onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonomerCreationWizard;
