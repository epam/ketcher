import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon, Dialog } from 'components';
import {
  Atom,
  AtomLabel,
  AttachmentPointClickData,
  AttachmentPointName,
  BaseMonomer,
  Bond,
  CoreEditor,
  CREATE_MONOMER_TOOL_NAME,
  getAttachmentPointLabel,
  getAttachmentPointNumberFromLabel,
  IKetMonomerTemplate,
  KetcherLogger,
  ketcherProvider,
  KetMonomerClass,
  MonomerCreationAttachmentPointClickEvent,
  Struct,
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
  AssignedAttachmentPointsByMonomerType,
  RnaPresetWizardAction,
  RnaPresetWizardState,
  RnaPresetWizardStateFieldId,
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
import { Selection } from '../../../../editor/Editor';
import { isNumber } from 'lodash';

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
  structure: undefined,
});

const initialWizardState: WizardState = getInitialWizardState();

const initialRnaPresetWizardState: RnaPresetWizardState = {
  base: getInitialWizardState(KetMonomerClass.Base),
  sugar: getInitialWizardState(KetMonomerClass.Sugar),
  phosphate: getInitialWizardState(KetMonomerClass.Phosphate),
  preset: {
    name: '',
    errors: {
      name: undefined,
    },
    notifications: new Map(),
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
  state: RnaPresetWizardState,
  action: RnaPresetWizardAction,
): RnaPresetWizardState => {
  if (action.type === 'ResetErrors') {
    return {
      ...state,
      preset: {
        ...state.preset,
        errors: {},
      },
    };
  }

  if (action.type === 'ResetWizard') {
    return initialRnaPresetWizardState;
  }

  if (action.type === 'RemoveNotification') {
    const presetNotifications = new Map(state.preset.notifications);
    const baseNotifications = new Map(state.base.notifications);
    const sugarNotifications = new Map(state.sugar.notifications);
    const phosphateNotifications = new Map(state.phosphate.notifications);

    presetNotifications.delete(action.id);
    baseNotifications.delete(action.id);
    sugarNotifications.delete(action.id);
    phosphateNotifications.delete(action.id);

    return {
      ...state,
      preset: {
        ...state.preset,
        notifications: presetNotifications,
      },
      sugar: {
        ...state.sugar,
        notifications: sugarNotifications,
      },
      base: {
        ...state.base,
        notifications: baseNotifications,
      },
      phosphate: {
        ...state.phosphate,
        notifications: phosphateNotifications,
      },
    };
  }

  if (!action.rnaComponentKey) {
    return state;
  }

  const { rnaComponentKey, ...restAction } = action;

  if (action.type === 'SetNotifications') {
    return {
      ...state,
      [action.rnaComponentKey]: {
        ...state[action.rnaComponentKey],
        notifications: action.notifications,
      },
    };
  }

  if (restAction.type === 'SetRnaPresetComponentStructure') {
    return {
      ...state,
      [rnaComponentKey]: {
        ...state[rnaComponentKey],
        structure: restAction.editor?.selection(),
      },
    };
  }

  if (rnaComponentKey !== 'preset') {
    return {
      ...state,
      [rnaComponentKey]: wizardReducer(state[rnaComponentKey], restAction),
    };
  }

  if (restAction.type === 'SetErrors') {
    return {
      ...state,
      preset: {
        ...state.preset,
        errors: {
          ...state.preset.errors,
          ...restAction.errors,
        },
      },
    };
  }

  if (restAction.type === 'SetFieldValue') {
    return {
      ...state,
      preset: {
        ...state.preset,
        [restAction.fieldId]: restAction.value,
        errors: {
          ...state.preset.errors,
          [restAction.fieldId]: undefined,
        },
      },
    };
  }

  return {
    ...state,
  };
};

const validateInputs = (values: WizardValues, skipUniquenessChecks = false) => {
  const editor = CoreEditor.provideEditorInstance();
  const errors: Partial<Record<WizardFormFieldId, boolean>> = {};
  const notifications = new Map<WizardNotificationId, WizardNotification>();
  const optionalFields = new Set(['aliasHELM', 'name']);

  Object.entries(values).forEach(([key, value]) => {
    if (!value?.trim()) {
      if (
        !optionalFields.has(key) &&
        (key !== 'naturalAnalogue' || isNaturalAnalogueRequired(values.type))
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

      if (
        !skipUniquenessChecks &&
        editor.checkIfMonomerSymbolClassPairExists(value, values.type)
      ) {
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

      if (
        !skipUniquenessChecks &&
        editor.checkIfMonomerSymbolClassPairExists(value, values.type)
      ) {
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

const validateStructure = (structure: Struct, editor: Editor) => {
  const notifications = new Map<WizardNotificationId, WizardNotification>();
  const isStructureImpure = Editor.isStructureImpure(structure);
  if (isStructureImpure) {
    notifications.set('impureStructure', {
      type: 'error',
      message: NotificationMessages.impureStructure,
    });
  }

  const isMinimalViableStructure = Editor.isMinimalViableStructure(
    structure,
    editor.monomerCreationState,
  );
  if (!isMinimalViableStructure) {
    notifications.set('notMinimalViableStructure', {
      type: 'error',
      message: NotificationMessages.notMinimalViableStructure,
    });
    return notifications;
  }

  const isStructureContinuous = Editor.isStructureContinuous(structure);
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

  const {
    values,
    notifications: monomerWizardNotifications,
    errors,
  } = wizardState;
  const { type, symbol, name, naturalAnalogue, aliasHELM } = values;
  const [modificationTypes, setModificationTypes] = useState<string[]>([]);
  const [leavingGroupDialogMessage, setLeavingGroupDialogMessage] =
    useState('');
  const isRnaPresetType = type === 'rnaPreset';
  const notifications = isRnaPresetType
    ? new Map([
        ...(rnaPresetWizardState.preset.notifications || []),
        ...(rnaPresetWizardState.sugar.notifications || []),
        ...(rnaPresetWizardState.base.notifications || []),
        ...(rnaPresetWizardState.phosphate.notifications || []),
      ])
    : monomerWizardNotifications;

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
      if ((type === 'rnaPreset' || value === 'rnaPreset') && type !== value) {
        wizardStateDispatch({
          type: 'ResetWizard',
        });
        rnaPresetWizardStateDispatch({
          type: 'ResetWizard',
        });
      } else {
        wizardStateDispatch({
          type: 'SetFieldValue',
          fieldId: 'aliasHELM',
          value: '',
        });
      }

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
    rnaPresetWizardStateDispatch({ type: 'ResetWizard' });
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
    newLeavingAtomLabel: AtomLabel,
  ) => {
    editor.changeLeavingAtomLabel(apName, newLeavingAtomLabel);
  };

  const handleAttachmentPointEditPopupClose = () => {
    setAttachmentPointEditPopupData(null);
    editor.cleanupCloseAttachmentPointEditPopup();
  };

  const handleDiscard = () => {
    editor.closeMonomerCreationWizard(true);

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

  const validateMonomerWizard = (
    assignedAttachmentPointsByMonomer: AssignedAttachmentPointsByMonomerType,
  ) => {
    let needSaveMonomers = true;

    if (!wizardState.structure) {
      KetcherLogger.error('Monomer structure is undefined');

      return;
    }

    const monomerAssignedAttachmentPoints =
      assignedAttachmentPointsByMonomer.get(wizardState);

    if (!monomerAssignedAttachmentPoints) {
      KetcherLogger.error('Monomer attachment points map is undefined');

      return;
    }

    const structure = editor.structSelected(wizardState.structure);
    const { values: valuesToSave } = wizardState;
    const { errors: inputsErrors, notifications: inputsNotifications } =
      validateInputs(valuesToSave);
    if (Object.keys(inputsErrors).length > 0) {
      needSaveMonomers = false;
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
    } = validateAttachmentPoints(
      Array.from(monomerAssignedAttachmentPoints.keys()),
    );
    if (attachmentPointsNotifications.size > 0) {
      needSaveMonomers = false;
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
      needSaveMonomers = false;
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

    const structureNotifications = validateStructure(structure, editor);
    if (structureNotifications.size > 0) {
      needSaveMonomers = false;
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
        monomerAssignedAttachmentPoints,
      );
      if (leavingGroupNotifications.size > 0) {
        needSaveMonomers = false;
        const firstMessage = Array.from(leavingGroupNotifications.values())[0]
          .message;
        setLeavingGroupDialogMessage(firstMessage);
      }
    }

    return needSaveMonomers;
  };

  const validateRnaPresetWizard = (
    assignedAttachmentPointsByMonomer: AssignedAttachmentPointsByMonomerType,
  ) => {
    let needSaveMonomers = true;
    const componentsToValidate: Array<{
      name: Exclude<RnaPresetWizardStateFieldId, 'preset'>;
      wizardState: WizardState;
    }> = [
      {
        name: 'base',
        wizardState: rnaPresetWizardState.base,
      },
      {
        name: 'phosphate',
        wizardState: rnaPresetWizardState.phosphate,
      },
      {
        name: 'sugar',
        wizardState: rnaPresetWizardState.sugar,
      },
    ];

    // check structure
    const wizardStruct = editor.struct();
    const bondsBetweenSugarAndBase: Bond[] = [];
    const bondsBetweenSugarAndPhosphate: Bond[] = [];
    const bondsBetweenBaseAndPhosphate: Bond[] = [];
    const atomsOutsideComponents: Atom[] = [];
    let hasSameAtomsInSeveralComponents = false;

    wizardStruct.bonds.forEach((bond) => {
      if (
        (rnaPresetWizardState.sugar.structure?.atoms?.includes(bond.begin) ||
          rnaPresetWizardState.sugar.structure?.atoms?.includes(bond.end)) &&
        (rnaPresetWizardState.base.structure?.atoms?.includes(bond.begin) ||
          rnaPresetWizardState.base.structure?.atoms?.includes(bond.end))
      ) {
        bondsBetweenSugarAndBase.push(bond);
      }

      if (
        (rnaPresetWizardState.sugar.structure?.atoms?.includes(bond.begin) ||
          rnaPresetWizardState.sugar.structure?.atoms?.includes(bond.end)) &&
        (rnaPresetWizardState.phosphate.structure?.atoms?.includes(
          bond.begin,
        ) ||
          rnaPresetWizardState.phosphate.structure?.atoms?.includes(bond.end))
      ) {
        bondsBetweenSugarAndPhosphate.push(bond);
      }

      if (
        (rnaPresetWizardState.base.structure?.atoms?.includes(bond.begin) ||
          rnaPresetWizardState.base.structure?.atoms?.includes(bond.end)) &&
        (rnaPresetWizardState.phosphate.structure?.atoms?.includes(
          bond.begin,
        ) ||
          rnaPresetWizardState.phosphate.structure?.atoms?.includes(bond.end))
      ) {
        bondsBetweenBaseAndPhosphate.push(bond);
      }
    });

    wizardStruct.atoms.forEach((atom, atomId) => {
      if (
        !rnaPresetWizardState.sugar.structure?.atoms?.includes(atomId) &&
        !rnaPresetWizardState.base.structure?.atoms?.includes(atomId) &&
        !rnaPresetWizardState.phosphate.structure?.atoms?.includes(atomId)
      ) {
        atomsOutsideComponents.push(atom);
      }
    });

    const atomsArrayFromAllComponents = [
      ...(rnaPresetWizardState.sugar.structure?.atoms || []),
      ...(rnaPresetWizardState.base.structure?.atoms || []),
      ...(rnaPresetWizardState.phosphate.structure?.atoms || []),
    ];
    const atomsSetFromAllComponents = new Set(atomsArrayFromAllComponents);

    hasSameAtomsInSeveralComponents =
      atomsSetFromAllComponents.size < atomsArrayFromAllComponents.length;

    if (
      hasSameAtomsInSeveralComponents ||
      atomsOutsideComponents.length > 0 ||
      bondsBetweenSugarAndBase.length !== 1 ||
      bondsBetweenSugarAndPhosphate.length !== 1 ||
      bondsBetweenBaseAndPhosphate.length !== 0
    ) {
      needSaveMonomers = false;
      rnaPresetWizardStateDispatch({
        type: 'SetNotifications',
        notifications: new Map([
          [
            'invalidRnaPresetStructure',
            {
              type: 'error',
              message: NotificationMessages.invalidRnaPresetStructure,
            },
          ],
        ]),
        rnaComponentKey: 'preset',
        editor,
      });
    }

    // check rna name
    if (!rnaPresetWizardState.preset.name?.trim()) {
      needSaveMonomers = false;
      rnaPresetWizardStateDispatch({
        type: 'SetErrors',
        errors: {
          name: true,
        },
        rnaComponentKey: 'preset',
        editor,
      });
      rnaPresetWizardStateDispatch({
        type: 'SetNotifications',
        notifications: new Map([
          [
            'emptyMandatoryFields',
            {
              type: 'error',
              message: NotificationMessages.emptyMandatoryFields,
            },
          ],
        ]),
        rnaComponentKey: 'preset',
        editor,
      });
    }

    componentsToValidate.forEach((componentToValidate) => {
      // Next validation is copy pasted from validateMonomerWizard and extended
      // Need to move same part in separate method
      const wizardState = componentToValidate.wizardState;
      const rnaComponentKey = componentToValidate.name;

      if (!wizardState.structure) {
        KetcherLogger.error('Monomer structure is undefined');

        return;
      }

      const monomerAssignedAttachmentPoints =
        assignedAttachmentPointsByMonomer.get(wizardState);

      if (!monomerAssignedAttachmentPoints) {
        KetcherLogger.error('Monomer attachment points map is undefined');

        return;
      }

      const structure = editor.structSelected(wizardState.structure);
      const { values: valuesToSave } = wizardState;
      // Skip uniqueness checks for RNA preset components - they are saved as hidden monomers
      const { errors: inputsErrors, notifications: inputsNotifications } =
        validateInputs(valuesToSave, true);
      if (Object.keys(inputsErrors).length > 0) {
        needSaveMonomers = false;
        rnaPresetWizardStateDispatch({
          type: 'SetErrors',
          errors: inputsErrors,
          rnaComponentKey,
          editor,
        });
        rnaPresetWizardStateDispatch({
          type: 'SetNotifications',
          notifications: inputsNotifications,
          rnaComponentKey,
          editor,
        });
        return;
      }

      const structureNotifications = validateStructure(structure, editor);
      if (structureNotifications.size > 0) {
        needSaveMonomers = false;
        rnaPresetWizardStateDispatch({
          type: 'SetNotifications',
          notifications: structureNotifications,
          rnaComponentKey,
          editor,
        });
      }
    });

    return needSaveMonomers;
  };

  const validateOnSubmit = (
    assignedAttachmentPointsByMonomer: AssignedAttachmentPointsByMonomerType,
  ) => {
    if (isRnaPresetType) {
      return validateRnaPresetWizard(assignedAttachmentPointsByMonomer);
    } else {
      return validateMonomerWizard(assignedAttachmentPointsByMonomer);
    }
  };

  const handleSubmit = () => {
    wizardStateDispatch({ type: 'ResetErrors' });
    rnaPresetWizardStateDispatch({ type: 'ResetErrors' });
    editor.setProblematicAttachmentPoints(new Set());

    const monomersToSave = isRnaPresetType
      ? [
          rnaPresetWizardState.base,
          rnaPresetWizardState.sugar,
          rnaPresetWizardState.phosphate,
        ]
      : [wizardState];
    const monomersData: Array<{
      atomIdMap: Map<number, number>;
      monomerStructureInWizard: Selection | null | undefined;
      monomer: BaseMonomer;
      monomerTemplate: IKetMonomerTemplate;
      monomerRef: string;
    }> = [];
    const assignedAttachmentPointsByMonomer: AssignedAttachmentPointsByMonomerType =
      new Map();

    if (!isRnaPresetType) {
      wizardState.structure = {
        atoms: [...editor.render.ctab.molecule.atoms.keys()],
        bonds: [...editor.render.ctab.molecule.bonds.keys()],
      };
    }

    // separate attachment points by preset components
    if (isRnaPresetType) {
      monomersToSave.forEach((componentWizardState) => {
        const assignedAttachmentPointsForComponent = new Map();

        assignedAttachmentPoints.forEach(
          ([attachmentAtomId, leavingGroupAtomId], attachmentPointName) => {
            if (
              componentWizardState.structure?.atoms?.includes(attachmentAtomId)
            ) {
              assignedAttachmentPointsForComponent.set(attachmentPointName, [
                attachmentAtomId,
                leavingGroupAtomId,
              ]);
            }
          },
        );

        assignedAttachmentPointsByMonomer.set(
          componentWizardState,
          assignedAttachmentPointsForComponent,
        );
      });
    } else {
      assignedAttachmentPointsByMonomer.set(
        wizardState,
        assignedAttachmentPoints,
      );
    }

    // validation
    const needSaveMonomers = validateOnSubmit(
      assignedAttachmentPointsByMonomer,
    );

    // save
    if (needSaveMonomers) {
      if (isRnaPresetType) {
        // fill attachment points between RNA preset components
        const struct = editor.struct();
        const baseStructure = rnaPresetWizardState.base.structure;
        const sugarStructure = rnaPresetWizardState.sugar.structure;
        const phosphateStructure = rnaPresetWizardState.phosphate.structure;

        const bondsBetweenSugarAndBase = struct.bonds.filter((_, bond) => {
          return Boolean(
            (baseStructure?.atoms?.includes(bond.begin) &&
              sugarStructure?.atoms?.includes(bond.end)) ||
              (baseStructure?.atoms?.includes(bond.end) &&
                sugarStructure?.atoms?.includes(bond.begin)),
          );
        });
        const bondsBetweenSugarAndPhosphate = struct.bonds.filter((_, bond) => {
          return Boolean(
            (phosphateStructure?.atoms?.includes(bond.begin) &&
              sugarStructure?.atoms?.includes(bond.end)) ||
              (phosphateStructure?.atoms?.includes(bond.end) &&
                sugarStructure?.atoms?.includes(bond.begin)),
          );
        });

        const bondBetweenSugarAndBase = [
          ...bondsBetweenSugarAndBase.values(),
        ][0];
        const bondBetweenSugarAndPhosphate = [
          ...bondsBetweenSugarAndPhosphate.values(),
        ][0];

        const sugarR3AttachmentPointAtom = sugarStructure?.atoms?.includes(
          bondBetweenSugarAndBase.begin,
        )
          ? bondBetweenSugarAndBase.begin
          : bondBetweenSugarAndBase.end;
        const sugarR2AttachmentPointAtom = sugarStructure?.atoms?.includes(
          bondBetweenSugarAndPhosphate.begin,
        )
          ? bondBetweenSugarAndPhosphate.begin
          : bondBetweenSugarAndPhosphate.end;
        const baseR1AttachmentPointAtom = baseStructure?.atoms?.includes(
          bondBetweenSugarAndBase.begin,
        )
          ? bondBetweenSugarAndBase.begin
          : bondBetweenSugarAndBase.end;
        const phosphateR1AttachmentPointAtom =
          phosphateStructure?.atoms?.includes(
            bondBetweenSugarAndPhosphate.begin,
          )
            ? bondBetweenSugarAndPhosphate.begin
            : bondBetweenSugarAndPhosphate.end;

        editor.assignConnectionPointAtom(
          baseR1AttachmentPointAtom,
          AttachmentPointName.R1,
          assignedAttachmentPointsByMonomer.get(rnaPresetWizardState.base),
          rnaPresetWizardState.base.structure,
          true,
        );
        editor.assignConnectionPointAtom(
          sugarR2AttachmentPointAtom,
          AttachmentPointName.R2,
          assignedAttachmentPointsByMonomer.get(rnaPresetWizardState.sugar),
          rnaPresetWizardState.sugar.structure,
          true,
        );
        editor.assignConnectionPointAtom(
          sugarR3AttachmentPointAtom,
          AttachmentPointName.R3,
          assignedAttachmentPointsByMonomer.get(rnaPresetWizardState.sugar),
          rnaPresetWizardState.sugar.structure,
          true,
        );
        editor.assignConnectionPointAtom(
          phosphateR1AttachmentPointAtom,
          AttachmentPointName.R1,
          assignedAttachmentPointsByMonomer.get(rnaPresetWizardState.phosphate),
          rnaPresetWizardState.phosphate.structure,
          true,
        );
      }

      monomersToSave.forEach((monomerToSave) => {
        const atomIdMap = new Map<number, number>();
        const bondIdMap = new Map<number, number>();
        const structure = editor.structSelected(
          monomerToSave.structure,
          atomIdMap,
          bondIdMap,
        );
        const monomerAssignedAttachmentPoints =
          assignedAttachmentPointsByMonomer.get(monomerToSave);

        monomerAssignedAttachmentPoints?.forEach(
          ([attachmentAtomId, leavingGroupAtomId], attachmentPointKey) => {
            const mappedAttachmentAtomId = atomIdMap.get(attachmentAtomId);
            const mappedLeavingGroupAtomId = atomIdMap.get(leavingGroupAtomId);

            if (
              !isNumber(mappedAttachmentAtomId) ||
              !isNumber(mappedLeavingGroupAtomId)
            ) {
              return;
            }

            monomerAssignedAttachmentPoints.set(attachmentPointKey, [
              mappedAttachmentAtomId,
              mappedLeavingGroupAtomId,
            ]);
          },
        );

        const result = editor.saveNewMonomer({
          type: monomerToSave.values.type,
          symbol: monomerToSave.values.symbol,
          name: monomerToSave.values.name || monomerToSave.values.symbol,
          naturalAnalogue: monomerToSave.values.naturalAnalogue,
          modificationTypes,
          aliasHELM: monomerToSave.values.aliasHELM,
          structure,
          attachmentPoints: monomerAssignedAttachmentPoints,
          // Mark monomers as hidden when they are part of a preset
          hidden: isRnaPresetType,
        });

        monomersData.push({
          ...result,
          monomerStructureInWizard: monomerToSave.structure,
          atomIdMap,
        });
      });

      editor.finishNewMonomersCreation(
        monomersData,
        rnaPresetWizardState.preset.name,
      );

      dispatch(onAction(selectRectangleAction));
      resetWizard();
    }
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
                wizardStateDispatch={
                  isRnaPresetType
                    ? rnaPresetWizardStateDispatch
                    : wizardStateDispatch
                }
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

                  wizardState.structure = {
                    atoms: [...editor.render.ctab.molecule.atoms.keys()],
                    bonds: [...editor.render.ctab.molecule.bonds.keys()],
                  };

                  const atomIdMap = new Map<number, number>();
                  const bondIdMap = new Map<number, number>();
                  const structure = editor.structSelected(
                    wizardState.structure,
                    atomIdMap,
                    bondIdMap,
                  );
                  const monomerData = editor.saveNewMonomer({
                    type,
                    symbol,
                    name: name || symbol,
                    naturalAnalogue,
                    modificationTypes,
                    aliasHELM,
                    attachmentPoints: assignedAttachmentPoints,
                    structure,
                  });

                  editor.finishNewMonomersCreation([
                    {
                      ...monomerData,
                      monomerStructureInWizard: wizardState.structure,
                      atomIdMap,
                    },
                  ]);

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
