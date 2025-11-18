import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon, Dialog } from 'components';
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
import { useEffect, useMemo, useReducer, useState } from 'react';
import clsx from 'clsx';
import { isNaturalAnalogueRequired } from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useDispatch, useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import { onAction } from '../../../state/shared';
import AttributeField from './components/AttributeField/AttributeField';
import Notification from './components/Notification/Notification';
import AttachmentPointEditPopup from '../AttachmentPointEditPopup/AttachmentPointEditPopup';
import {
  RnaPresetWizardAction,
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
import { validateMonomerLeavingGroups } from './MonomerLeavingGroupValidator';
import { useAppContext } from '../../../../../hooks';
import Editor from '../../../../editor';
import { KETCHER_ROOT_NODE_CSS_SELECTOR } from '../../../../../constants';
import { createPortal } from 'react-dom';
import tools from '../../../action/tools';
import MonomerCreationWizardFields from './MonomerCreationWizardFields';
import { RnaPresetTabs } from './RnaPresetTabs';

const getInitialWizardState = (type = KetMonomerClass.CHEM): WizardState => ({
  values: {
    type,
    symbol: '',
    name: '',
    naturalAnalogue: '',
    aliasHELM: '',
  },
  errors: {},
  notifications: new Map(),
  structure: null,
});

const initialWizardState: WizardState = getInitialWizardState();

const initialRnaPresetWizardState = {
  base: getInitialWizardState(KetMonomerClass.Base),
  sugar: getInitialWizardState(KetMonomerClass.Sugar),
  phosphate: getInitialWizardState(KetMonomerClass.Phosphate),
  preset: {
    name: '',
    errors: {
      name: null,
    },
  },
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

const rnaPresetWizardReducer = (
  state: typeof initialRnaPresetWizardState,
  action: RnaPresetWizardAction,
) => {
  const { rnaComponentKey, editor, ...restAction } = action;

  if (restAction.type === 'SetRnaPresetComponentStructure') {
    return {
      ...state,
      [rnaComponentKey]: {
        ...state[rnaComponentKey],
        structure: editor?.selection(),
      },
    };
  }

  if (rnaComponentKey !== 'preset') {
    return {
      ...state,
      [rnaComponentKey]: wizardReducer(state[rnaComponentKey], restAction),
    };
  }

  if (restAction.type === 'SetFieldValue') {
    return {
      ...state,
      preset: {
        ...state.preset,
        [restAction.fieldId]: restAction.value,
      },
    };
  }

  return {
    ...state,
  };
};

const validateInputs = (values: WizardValues) => {
  const editor = CoreEditor.provideEditorInstance();
  const errors: Partial<Record<WizardFormFieldId, boolean>> = {};
  const notifications = new Map<WizardNotificationId, WizardNotification>();

  Object.entries(values).forEach(([key, value]) => {
    if (!value?.trim()) {
      if (
        (key !== 'naturalAnalogue' || isNaturalAnalogueRequired(values.type)) &&
        key !== 'aliasHELM'
      ) {
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

      if (editor.checkIfMonomerSymbolClassPairExists(value, values.type)) {
        errors[key as WizardFormFieldId] = true;
        notifications.set('symbolExists', {
          type: 'error',
          message: NotificationMessages.symbolExists,
        });
      }
    }

    if (key === 'aliasHELM') {
      const helmAliasRegex = /^[A-Za-z0-9\-_\\*]*$/;

      if (value && !helmAliasRegex.test(value)) {
        errors[key as WizardFormFieldId] = true;
        notifications.set('invalidHELMAlias', {
          type: 'error',
          message: NotificationMessages.invalidHELMAlias,
        });

        return;
      }

      if (editor.checkIfMonomerSymbolClassPairExists(value, values.type)) {
        errors[key as WizardFormFieldId] = true;
        notifications.set('notUniqueHELMAlias', {
          type: 'error',
          message: NotificationMessages.notUniqueHELMAlias,
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

const validateStructure = (editor: Editor) => {
  const notifications = new Map<WizardNotificationId, WizardNotification>();
  const isStructureImpure = Editor.isStructureImpure(editor.struct());
  if (isStructureImpure) {
    notifications.set('impureStructure', {
      type: 'error',
      message: NotificationMessages.impureStructure,
    });
  }

  const isMinimalViableStructure = editor.isMinimalViableStructure();
  if (!isMinimalViableStructure) {
    notifications.set('notMinimalViableStructure', {
      type: 'error',
      message: NotificationMessages.notMinimalViableStructure,
    });
    return notifications;
  }

  const isStructureContinuous = Editor.isStructureContinuous(editor.struct());
  if (!isStructureContinuous) {
    notifications.set('incontinuousStructure', {
      type: 'error',
      message: NotificationMessages.incontinuousStructure,
    });
  }

  return notifications;
};

const validateModificationTypes = (
  modificationTypes: string[],
  naturalAnalogue: string,
) => {
  const editor = CoreEditor.provideEditorInstance();
  const notifications = new Map<WizardNotificationId, WizardNotification>();
  const errors: Record<string, boolean> = {};
  const modificationTypesGroupedByNaturalAnalogue =
    editor.getAllAminoAcidsModificationTypesGroupedByNaturalAnalogue();
  const hasEmptyType = modificationTypes.some(
    (modificationType) => !modificationType.trim(),
  );

  // Check for empty modification types
  if (hasEmptyType) {
    errors.emptyModificationType = true;
    notifications.set('emptyMandatoryFields', {
      type: 'error',
      message: NotificationMessages.emptyMandatoryFields,
    });
  }

  // Check for duplicate modification types
  modificationTypes.forEach((modificationType) => {
    const occurrences = modificationTypes.filter(
      (type) => type === modificationType,
    ).length;

    if (occurrences > 1) {
      errors[modificationType] = true;
      notifications.set('symbolExists', {
        type: 'error',
        message: NotificationMessages.notUniqueModificationTypes,
      });
    }
  });

  // Check if same modification types exist for same natural analogues
  modificationTypesGroupedByNaturalAnalogue[naturalAnalogue]?.forEach(
    (modificationTypeInsideSameNaturalAnalogue) => {
      if (
        modificationTypes.includes(modificationTypeInsideSameNaturalAnalogue)
      ) {
        errors[modificationTypeInsideSameNaturalAnalogue] = true;
        notifications.set('modificationTypeExists', {
          type: 'error',
          message: NotificationMessages.modificationTypeExists,
        });
      }
    },
  );

  return { notifications, errors };
};

const MonomerCreationWizard = () => {
  const { ketcherId } = useAppContext();
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const editor = ketcher.editor as Editor;
  const dispatch = useDispatch();

  const [wizardState, wizardStateDispatch] = useReducer(
    wizardReducer,
    initialWizardState,
  );
  const [rnaPresetWizardState, rnaPresetWizardStateDispatch] = useReducer(
    rnaPresetWizardReducer,
    initialRnaPresetWizardState,
  );

  const [attachmentPointEditPopupData, setAttachmentPointEditPopupData] =
    useState<AttachmentPointClickData | null>(null);

  const { values, notifications, errors } = wizardState;
  const { type, symbol, name, naturalAnalogue, aliasHELM } = values;
  const [modificationTypes, setModificationTypes] = useState<string[]>([]);
  const [leavingGroupDialogMessage, setLeavingGroupDialogMessage] =
    useState('');

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
      const { attachmentPointName, position } = clickData;

      setAttachmentPointEditPopupData({
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
    if (['type', 'naturalAnalogue'].includes(fieldId)) {
      setModificationTypes([]);
    }
    if (fieldId === 'type') {
      wizardStateDispatch({
        type: 'SetFieldValue',
        fieldId: 'type',
        value: value as KetMonomerClass,
      });

      if (
        (type === KetMonomerClass.RNA || value === KetMonomerClass.RNA) &&
        type !== value
      ) {
        wizardStateDispatch({
          type: 'ResetWizard',
        });
      } else {
        wizardStateDispatch({
          type: 'SetFieldValue',
          fieldId: 'aliasHELM',
          value: '',
        });
      }
    } else {
      wizardStateDispatch({
        type: 'SetFieldValue',
        fieldId,
        value,
      });
    }
  };

  useEffect(() => {
    editor?.setMonomerCreationSelectedType?.(values.type);
  }, [editor, values.type]);

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

  const selectRectangleAction = tools['select-rectangle'].action;

  const handleAttachmentPointNameChange = (
    currentName: AttachmentPointName,
    newName: AttachmentPointName,
  ) => {
    editor.reassignAttachmentPoint(currentName, newName);
  };

  const handleLeavingAtomChange = (
    apName: AttachmentPointName,
    newLeavingAtomId: number,
  ) => {
    editor.reassignAttachmentPointLeavingAtom(apName, newLeavingAtomId);
  };

  const handleAttachmentPointEditPopupClose = () => {
    setAttachmentPointEditPopupData(null);
    editor.cleanupCloseAttachmentPointEditPopup();
  };

  const handleDiscard = () => {
    editor.closeMonomerCreationWizard();
    dispatch(onAction(selectRectangleAction));
    resetWizard();
  };

  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);

  useEffect(() => {
    if (monomerCreationState?.hasDefaultAttachmentPoints) {
      wizardStateDispatch({
        type: 'AddNotification',
        id: 'defaultAttachmentPoints',
      });
    }
  }, [monomerCreationState?.hasDefaultAttachmentPoints]);

  if (!monomerCreationState) {
    return null;
  }

  const { assignedAttachmentPoints } = monomerCreationState;

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

    const {
      notifications: attachmentPointsNotifications,
      problematicAttachmentPoints,
    } = validateAttachmentPoints(Array.from(assignedAttachmentPoints.keys()));
    if (attachmentPointsNotifications.size > 0) {
      wizardStateDispatch({
        type: 'SetNotifications',
        notifications: attachmentPointsNotifications,
      });
      editor.setProblematicAttachmentPoints(problematicAttachmentPoints);
      return;
    }

    const {
      errors: modificationTypesErrors,
      notifications: modificationTypesNotifications,
    } = validateModificationTypes(modificationTypes, naturalAnalogue);
    if (Object.keys(modificationTypesErrors).length > 0) {
      wizardStateDispatch({
        type: 'SetErrors',
        errors: modificationTypesErrors,
      });
      wizardStateDispatch({
        type: 'SetNotifications',
        notifications: modificationTypesNotifications,
      });
      return;
    }

    const structureNotifications = validateStructure(editor);
    if (structureNotifications.size > 0) {
      wizardStateDispatch({
        type: 'SetNotifications',
        notifications: structureNotifications,
      });
      return;
    }

    if (type) {
      const leavingGroupNotifications = validateMonomerLeavingGroups(
        editor,
        type,
        assignedAttachmentPoints,
      );
      if (leavingGroupNotifications.size > 0) {
        const firstMessage = Array.from(leavingGroupNotifications.values())[0]
          .message;
        setLeavingGroupDialogMessage(firstMessage);
        return;
      }
    }

    editor.saveNewMonomer({
      type,
      symbol,
      name,
      naturalAnalogue,
      modificationTypes,
      aliasHELM,
    });

    dispatch(onAction(selectRectangleAction));
    resetWizard();
  };

  const ketcherEditorRootElement = document.querySelector(
    KETCHER_ROOT_NODE_CSS_SELECTOR,
  );
  const displayEditDialog =
    attachmentPointEditPopupData !== null && ketcherEditorRootElement !== null;
  const isPresetType = type === 'rnaPreset';

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
        <div className={styles.attributesWindow}>
          <div
            className={clsx(
              styles.attributesFields,
              selectStyles.selectContainer,
            )}
          >
            <AttributeField
              title="Type"
              control={
                <Select
                  className={styles.input}
                  options={monomerTypeSelectOptions}
                  placeholder="Select monomer type"
                  data-testid="type-select"
                  value={type}
                  onChange={(value) => {
                    handleFieldChange('type', value);
                  }}
                  error={errors.type}
                />
              }
              required
            />
            <p className={styles.attributesTitle}>Attributes</p>
            {isPresetType ? (
              <RnaPresetTabs
                wizardState={rnaPresetWizardState}
                wizardStateDispatch={rnaPresetWizardStateDispatch}
                editor={editor}
              />
            ) : (
              <MonomerCreationWizardFields
                wizardState={wizardState}
                assignedAttachmentPoints={assignedAttachmentPoints}
                onFieldChange={(fieldId: WizardFormFieldId, value: string) => {
                  handleFieldChange(fieldId, value);
                }}
                onChangeModificationTypes={(modificationTypes: string[]) => {
                  setModificationTypes(modificationTypes);
                }}
              />
            )}
          </div>
        </div>

        {displayEditDialog &&
          createPortal(
            <AttachmentPointEditPopup
              data={attachmentPointEditPopupData}
              onNameChange={handleAttachmentPointNameChange}
              onLeavingAtomChange={handleLeavingAtomChange}
              onClose={handleAttachmentPointEditPopupClose}
              editor={editor}
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
      {leavingGroupDialogMessage &&
        ketcherEditorRootElement &&
        createPortal(
          <div className={styles.dialogOverlay}>
            <Dialog
              className={styles.smallDialog}
              title="Non-typical attachment points"
              withDivider={true}
              valid={() => true}
              params={{
                onOk: () => {
                  setLeavingGroupDialogMessage('');
                  editor.saveNewMonomer({
                    type,
                    symbol,
                    name,
                    naturalAnalogue,
                    modificationTypes,
                    aliasHELM,
                  });
                  dispatch(onAction(selectRectangleAction));
                  resetWizard();
                },
                onCancel: () => setLeavingGroupDialogMessage(''),
              }}
              buttons={['OK', 'Cancel']}
              buttonsNameMap={{ OK: 'Yes', Cancel: 'Cancel' }}
              primaryButtons={['Cancel']}
            >
              <div className={styles.DialogMessage}>
                {leavingGroupDialogMessage}
              </div>
            </Dialog>
          </div>,
          ketcherEditorRootElement,
        )}
    </div>
  );
};

export default MonomerCreationWizard;
