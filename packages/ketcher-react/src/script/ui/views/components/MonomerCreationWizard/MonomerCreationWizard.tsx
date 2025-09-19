import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon } from 'components';
import {
  AttachmentPointClickData,
  AttachmentPointName,
  CoreEditor,
  CREATE_MONOMER_TOOL_NAME,
  getAttachmentPointLabel,
  getAttachmentPointNumberFromLabel,
  ketcherProvider,
  KetMonomerClass,
  MonomerCreationAttachmentPointClickEvent,
} from 'ketcher-core';
import Select from '../../../component/form/Select';
import { ChangeEvent, useEffect, useMemo, useReducer, useState } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker, {
  isNaturalAnalogueRequired,
} from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import AttributeField from './components/AttributeField/AttributeField';
import Notification from './components/Notification/Notification';
import AttachmentPointEditPopup from '../AttachmentPointEditPopup/AttachmentPointEditPopup';
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
import { useAppContext } from '../../../../../hooks';
import Editor from '../../../../editor';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from '../../../../../constants';
import { createPortal } from 'react-dom';
import AttachmentPoint from './components/AttachmentPoint/AttachmentPoint';
import assert from 'assert';

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
      if (editor.checkIfMonomerSymbolClassPairExists(value, values.type)) {
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

const validateAttachmentPoints = (attachmentPoints: AttachmentPointName[]) => {
  const notifications = new Map<WizardNotificationId, WizardNotification>();
  const problematicAttachmentPoints = new Set<AttachmentPointName>();

  if (attachmentPoints.length === 0) {
    notifications.set('noAttachmentPoints', {
      type: 'error',
      message: NotificationMessages.noAttachmentPoints,
    });

    return { notifications, problematicAttachmentPoints };
  }

  const sideAttachmentPoints = attachmentPoints.filter(
    (attachmentPointName) => {
      const pointNumber =
        getAttachmentPointNumberFromLabel(attachmentPointName);
      return pointNumber > 2;
    },
  );

  if (sideAttachmentPoints.length === 0) {
    return { notifications, problematicAttachmentPoints };
  }

  const expectedSequence: number[] = [];
  for (let i = 3; i < 3 + sideAttachmentPoints.length; i++) {
    expectedSequence.push(i);
  }

  const actualNumbers = sideAttachmentPoints
    .map(getAttachmentPointNumberFromLabel)
    .sort((a, b) => a - b);

  actualNumbers.forEach((actualNumber) => {
    if (!expectedSequence.includes(actualNumber)) {
      const problematicPointName = getAttachmentPointLabel(actualNumber);
      problematicAttachmentPoints.add(problematicPointName);
    }
  });

  if (problematicAttachmentPoints.size > 0) {
    notifications.set('incorrectAttachmentPointsOrder', {
      type: 'error',
      message: NotificationMessages.incorrectAttachmentPointsOrder,
    });
  }

  return { notifications, problematicAttachmentPoints };
};

const MonomerCreationWizard = () => {
  const { ketcherId } = useAppContext();
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const editor = ketcher.editor as Editor;

  const [wizardState, wizardStateDispatch] = useReducer(
    wizardReducer,
    initialWizardState,
  );

  const [attachmentPointEditPopupData, setAttachmentPointEditPopupData] =
    useState<AttachmentPointClickData | null>(null);

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

  useEffect(() => {
    const attachmentPointClickHandler = (event: Event) => {
      const clickData = (event as CustomEvent<AttachmentPointClickData>).detail;
      const { atomId, atomLabel, attachmentPointName, position } = clickData;

      setAttachmentPointEditPopupData({
        atomId,
        atomLabel,
        attachmentPointName,
        position,
      });
    };

    window.addEventListener(
      MonomerCreationAttachmentPointClickEvent,
      attachmentPointClickHandler,
    );

    return () => {
      window.removeEventListener(
        MonomerCreationAttachmentPointClickEvent,
        attachmentPointClickHandler,
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
    setAttachmentPointEditPopupData(null);
  };

  const handleAttachmentPointNameChange = (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => {
    editor.reassignAttachmentPoint(currentName, newName);
  };

  const handleAttachmentPointAtomChange = (
    atomId: number,
    atomLabel: string,
  ) => {
    editor.reassignAttachmentPointAtom(atomId, atomLabel);
  };

  const handleAttachmentPointEditPopupClose = () => {
    setAttachmentPointEditPopupData(null);
    editor.cleanupCloseAttachmentPointEditPopup();
  };

  const handleDiscard = () => {
    editor.closeMonomerCreationWizard();
    resetWizard();
  };

  const handleSubmit = () => {
    wizardStateDispatch({ type: 'ResetErrors' });
    editor.setProblematicAttachmentPoints(new Set());

    const { errors: inputsErrors, notifications: inputsNotifications } =
      validateInputs(values);
    if (Object.keys(inputsErrors).length > 0) {
      wizardStateDispatch({ type: 'SetErrors', errors: inputsErrors });
      wizardStateDispatch({
        type: 'SetNotifications',
        notifications: inputsNotifications,
      });
      return;
    }

    assert(editor.monomerCreationState);

    const {
      notifications: attachmentPointsNotifications,
      problematicAttachmentPoints,
    } = validateAttachmentPoints(
      Array.from(editor.monomerCreationState.assignedAttachmentPoints.keys()),
    );
    if (attachmentPointsNotifications.size > 0) {
      wizardStateDispatch({
        type: 'SetNotifications',
        notifications: attachmentPointsNotifications,
      });
      editor.setProblematicAttachmentPoints(problematicAttachmentPoints);
      return;
    }

    editor.saveNewMonomer({
      type,
      symbol,
      name,
      naturalAnalogue,
    });

    resetWizard();
  };

  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);

  if (!monomerCreationState) {
    return null;
  }

  const { assignedAttachmentPoints } = monomerCreationState;
  const attachmentPointsData = Array.from(
    assignedAttachmentPoints.entries(),
  ).map((entry) => {
    const [attachmentPointName, [, leavingAtomId]] = entry as [
      AttachmentPointName,
      [number, number],
    ];
    const atom = editor.struct().atoms.get(leavingAtomId);

    // TODO: Should be assert but it fails due to assignedAttachmentsPoints being stale after closing, investigate
    if (!atom) {
      return {
        name: attachmentPointName,
        atomLabel: 'H',
        implicitH: 0,
      };
    }

    return {
      name: attachmentPointName,
      atomLabel: atom.label,
      implicitH: atom.implicitH,
    };
  });

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_ROOT_NODE_CSS_SELECTOR,
  );

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
                  className={styles.input}
                  options={monomerTypeSelectOptions}
                  placeholder="Select monomer type"
                  data-testid="type-select"
                  value={type}
                  onChange={(value) => handleFieldChange('type', value)}
                  error={errors.type}
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
                  placeholder="e.g. PEG-2"
                  data-testid="symbol-input"
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
                  placeholder="e.g. Diethylene Glycol"
                  value={name}
                  data-testid="name-input"
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
                  monomerType={type}
                  value={naturalAnalogue}
                  onChange={(value) =>
                    handleFieldChange('naturalAnalogue', value)
                  }
                  error={errors.naturalAnalogue}
                />
              }
              disabled={!isNaturalAnalogueRequired(type)}
              required
            />
          </div>

          {attachmentPointsData.length > 0 && (
            <>
              <div className={styles.divider} />

              <div className={styles.attributesFields}>
                <p className={styles.attachmentPointsTitle}>
                  Attachment points
                </p>
                <div className={styles.attachmentPoints}>
                  {attachmentPointsData.map(
                    ({ name, atomLabel, implicitH }) => (
                      <AttachmentPoint
                        name={name}
                        atomLabel={atomLabel}
                        implicitH={implicitH}
                        key={name}
                      />
                    ),
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {ketcherEditorRootElement &&
          createPortal(
            <AttachmentPointEditPopup
              data={attachmentPointEditPopupData}
              onNameChange={handleAttachmentPointNameChange}
              onAtomChange={handleAttachmentPointAtomChange}
              onClose={handleAttachmentPointEditPopupClose}
            />,
            ketcherEditorRootElement,
          )}

        <div className={styles.buttonsContainer}>
          <button
            className={styles.buttonDiscard}
            onClick={handleDiscard}
            data-testid="discard-button"
          >
            Discard
          </button>
          <button
            className={styles.buttonSubmit}
            onClick={handleSubmit}
            data-testid="submit-button"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonomerCreationWizard;
