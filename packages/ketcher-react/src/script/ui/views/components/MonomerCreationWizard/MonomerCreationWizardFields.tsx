import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon, IconButton } from 'components';
import {
  AttachmentPointClickData,
  AttachmentPointName,
  ketcherProvider,
  KetMonomerClass,
  MonomerCreationAttachmentPointClickEvent,
} from 'ketcher-core';
import { ChangeEvent, useEffect, useReducer, useState } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker, {
  isNaturalAnalogueRequired,
} from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import AttributeField from './components/AttributeField/AttributeField';
import {
  WizardAction,
  WizardFormFieldId,
  WizardNotificationId,
  WizardState,
} from './MonomerCreationWizard.types';
import {
  MonomerCreationExternalNotificationAction,
  NotificationMessages,
  NotificationTypes,
  MAX_MODIFICATION_TYPES,
} from './MonomerCreationWizard.constants';
import { useAppContext } from '../../../../../hooks';
import Editor from '../../../../editor';
import AttachmentPoint from './components/AttachmentPoint/AttachmentPoint';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import accordionClasses from '../../../../../components/Accordion/Accordion.module.less';
import ModificationTypeDropdown from './components/ModificationTypeDropdown/ModificationTypeDropdown';
import { Autocomplete, TextField } from '@mui/material';

const initialWizardState: WizardState = {
  values: {
    type: undefined,
    symbol: '',
    name: '',
    naturalAnalogue: '',
    aliasHELM: '',
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

interface IMonomerCreationWizardFieldsProps {
  type: KetMonomerClass | undefined;
}

const MonomerCreationWizardFields = (
  props: IMonomerCreationWizardFieldsProps,
) => {
  const { ketcherId } = useAppContext();
  const ketcher = ketcherProvider.getKetcher(ketcherId);
  const editor = ketcher.editor as Editor;

  const [wizardState, wizardStateDispatch] = useReducer(
    wizardReducer,
    initialWizardState,
  );

  const [attachmentPointEditPopupData, setAttachmentPointEditPopupData] =
    useState<AttachmentPointClickData | null>(null);

  const type = props.type;
  const { values, notifications, errors } = wizardState;
  const { symbol, name, naturalAnalogue, aliasHELM } = values;
  const [modificationTypes, setModificationTypes] = useState<string[]>([]);

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
      wizardStateDispatch({
        type: 'SetFieldValue',
        fieldId: 'aliasHELM',
        value: '',
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

  const handleModificationTypeChange = (
    indexToChange: number,
    value: string,
  ) => {
    setModificationTypes((types) =>
      types.map((t, i) => (i === indexToChange ? value : t)),
    );
  };

  const handleAddModificationType = () => {
    setModificationTypes((types) => {
      if (types.length >= MAX_MODIFICATION_TYPES) {
        return types;
      }
      return [...types, ''];
    });
  };

  const deleteModificationType = (indexToDelete: number) => {
    setModificationTypes((types) =>
      types.filter((_, i) => i !== indexToDelete),
    );
  };

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

  const handleAttachmentPointRemove = (name: AttachmentPointName) => {
    editor.removeAttachmentPoint(name);
  };

  const monomerCreationState = useSelector(editorMonomerCreationStateSelector);

  if (!monomerCreationState) {
    return null;
  }

  const { assignedAttachmentPoints } = monomerCreationState;

  const displayModificationTypes = type === KetMonomerClass.AminoAcid;
  const displayAliases =
    type &&
    [
      KetMonomerClass.AminoAcid,
      KetMonomerClass.Base,
      KetMonomerClass.Sugar,
      KetMonomerClass.Phosphate,
    ].includes(type);

  return (
    <div>
      <div
        className={clsx(styles.attributesFields, selectStyles.selectContainer)}
      >
        <AttributeField
          title="Symbol"
          control={
            <input
              type="text"
              className={clsx(styles.input, errors.symbol && styles.inputError)}
              placeholder="e.g. PEG-2"
              data-testid="symbol-input"
              value={symbol}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleFieldChange('symbol', event.target.value)
              }
              disabled={!type}
            />
          }
          required
          disabled={!type}
        />
        <AttributeField
          title="Name"
          control={
            <input
              type="text"
              className={clsx(styles.input, errors.name && styles.inputError)}
              placeholder="e.g. Diethylene Glycol"
              value={name}
              data-testid="name-input"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                handleFieldChange('name', event.target.value)
              }
              disabled={!type}
            />
          }
          required
          disabled={!type}
        />
        <AttributeField
          title="Natural analogue"
          control={
            <NaturalAnaloguePicker
              monomerType={type}
              value={naturalAnalogue}
              onChange={(value) => {
                handleFieldChange('naturalAnalogue', value);
              }}
              error={errors.naturalAnalogue}
            />
          }
          disabled={!isNaturalAnalogueRequired(type)}
          required
        />
      </div>

      <div className={styles.divider} />

      <div
        className={clsx(styles.attributesFields, selectStyles.selectContainer)}
      >
        <div className={styles.attachmentPointsHeader}>
          <p className={styles.attachmentPointsTitle}>Attachment points</p>
          <span
            className={styles.attachmentPointInfoIcon}
            title="To add new attachment points, right-click and mark atoms as leaving groups or connection points."
            data-testid="attachment-point-info-icon"
          >
            <Icon name="about" />
          </span>
        </div>
        {assignedAttachmentPoints.size > 0 && (
          <div className={styles.attachmentPoints}>
            {Array.from(assignedAttachmentPoints.entries()).map(
              ([name, atomPair]) => (
                <AttachmentPoint
                  name={name}
                  editor={editor}
                  onNameChange={handleAttachmentPointNameChange}
                  onLeavingAtomChange={handleLeavingAtomChange}
                  onRemove={handleAttachmentPointRemove}
                  key={`${name}-${atomPair[0]}-${atomPair[1]}`}
                />
              ),
            )}
          </div>
        )}
      </div>

      {displayModificationTypes && (
        <>
          <div className={styles.divider} />

          <div>
            <Accordion
              className={clsx(accordionClasses.accordion, styles.accordion)}
              square
            >
              <AccordionSummary
                className={styles.accordionSummary}
                expandIcon={
                  <Icon
                    className={accordionClasses.expandIcon}
                    name="chevron"
                  />
                }
                data-testid="modification-types-accordion"
              >
                Modification
              </AccordionSummary>
              <AccordionDetails>
                {modificationTypes.map((modificationType, idx) => (
                  <div className={styles.modificationTypeRow} key={idx}>
                    <ModificationTypeDropdown
                      value={modificationType}
                      naturalAnalogue={naturalAnalogue}
                      error={
                        errors[modificationType] ||
                        (errors.emptyModificationType &&
                          !modificationType.trim())
                      }
                      onChange={(value) =>
                        handleModificationTypeChange(idx, value)
                      }
                      testId={`modification-type-dropdown-${idx}`}
                    />

                    <IconButton
                      iconName="delete"
                      className={styles.deleteModificationTypeButton}
                      title="Delete modification type"
                      onClick={() => deleteModificationType(idx)}
                      testId={`delete-modification-type-button-${idx}`}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  className={styles.addModificationTypeButton}
                  onClick={handleAddModificationType}
                  disabled={modificationTypes.length >= MAX_MODIFICATION_TYPES}
                  data-testid="add-modification-type-button"
                >
                  Add modification type
                </button>
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      )}

      {displayAliases && (
        <>
          <div className={styles.divider} />

          <div>
            <Accordion
              className={clsx(accordionClasses.accordion, styles.accordion)}
              square
            >
              <AccordionSummary
                className={styles.accordionSummary}
                expandIcon={
                  <Icon
                    className={accordionClasses.expandIcon}
                    name="chevron"
                  />
                }
                data-testid="aliases-accordion"
              >
                Aliases
              </AccordionSummary>
              <AccordionDetails>
                <p className={styles.inputLabel}>HELM</p>
                <Autocomplete
                  freeSolo
                  options={[]}
                  value={aliasHELM}
                  onInputChange={(_event, newValue) =>
                    handleFieldChange('aliasHELM', newValue)
                  }
                  data-testid="helm-alias-input"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      className={clsx(
                        styles.inputField,
                        errors.aliasHELM && styles.error,
                      )}
                      error={Boolean(errors.aliasHELM)}
                    />
                  )}
                />
              </AccordionDetails>
            </Accordion>
          </div>
        </>
      )}
    </div>
  );
};

export default MonomerCreationWizardFields;
