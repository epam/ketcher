import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon } from 'components';
import { CREATE_MONOMER_TOOL_NAME, KetMonomerClass } from 'ketcher-core';
import Select from '../../../component/form/Select';
import { ChangeEvent, useMemo, useReducer } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useDispatch, useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import {
  closeMonomerCreationWizard,
  submitMonomerCreation,
} from '../../../state/editor/actions/monomerCreation';
import AttributeField from './components/AttributeField/AttributeField';
import Notification from './components/Notification/Notification';
import {
  MonomerTypeSelectItem,
  WizardAction,
  WizardFormFieldId,
  WizardState,
} from './MonomerCreationWizard.types';

const MonomerTypeSelectConfig: MonomerTypeSelectItem[] = [
  {
    value: KetMonomerClass.AminoAcid,
    label: 'Amino acid',
    iconName: 'peptide',
  },
  { value: KetMonomerClass.Sugar, label: 'Sugar', iconName: 'sugar' },
  { value: KetMonomerClass.Base, label: 'Base', iconName: 'base' },
  {
    value: KetMonomerClass.Phosphate,
    label: 'Phosphate',
    iconName: 'phosphate',
  },
  { value: KetMonomerClass.RNA, label: 'Nucleotide', iconName: 'nucleotide' },
  { value: KetMonomerClass.CHEM, label: 'CHEM', iconName: 'chem' },
];

const initialWizardState: WizardState = {
  values: {
    type: undefined,
    symbol: '',
    name: '',
    naturalAnalogue: '',
  },
  errors: {},
  notifications: [
    {
      id: 0,
      type: 'info',
      message:
        'Open bonds are replaced with Hydrogen (H), and set as Attachment Points by default',
    },
  ],
};

const wizardReducer = (
  state: WizardState,
  action: WizardAction,
): WizardState => {
  switch (action.type) {
    case 'SetFieldValue': {
      const { fieldId, value } = action;
      return {
        ...state,
        values: {
          ...state.values,
          [fieldId]: value,
        },
        errors: {
          ...state.errors,
          [fieldId]: undefined,
        },
      };
    }

    case 'ResetWizard': {
      return initialWizardState;
    }

    case 'RemoveNotification':
      return {
        ...state,
        notifications: state.notifications.filter(
          (notification) => notification.id !== action.id,
        ),
      };

    default:
      return state;
  }
};

const MonomerCreationWizard = () => {
  const reduxDispatch = useDispatch();
  const [wizardState, wizardStateDispatch] = useReducer(
    wizardReducer,
    initialWizardState,
  );

  const { values, notifications, errors } = wizardState;
  const { type, symbol, name, naturalAnalogue } = values;

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

  const displayNaturalAnaloguePicker =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.RNA;

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
    // TODO: Validate inputs
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

  const { attachmentPoints } = monomerCreationState;

  return (
    <div className={styles.monomerCreationWizard}>
      <div className={styles.leftColumn}>
        <p className={styles.wizardTitle}>
          <Icon name={CREATE_MONOMER_TOOL_NAME} />
          Create Monomer
        </p>

        <div className={styles.notificationsArea}>
          {notifications.map(({ id, type, message }) => (
            <Notification
              id={id}
              type={type}
              message={message}
              key={id}
              wizardStateDispatch={wizardStateDispatch}
            />
          ))}
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
                  className={styles.input}
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
                  className={styles.input}
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
                  monomerType={type}
                  value={naturalAnalogue}
                  onChange={(value) =>
                    handleFieldChange('naturalAnalogue', value)
                  }
                  disabled={!displayNaturalAnaloguePicker}
                />
              }
              disabled={!displayNaturalAnaloguePicker}
              required
            />
          </div>

          <div className={styles.divider} />

          <div className={styles.attributesFields}>
            <p className={styles.attachmentPointsTitle}>Attachment points</p>
            <div className={styles.attachmentPoints}>
              {[...attachmentPoints.entries()].map(
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
