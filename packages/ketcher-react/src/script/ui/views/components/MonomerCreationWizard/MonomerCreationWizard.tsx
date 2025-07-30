import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon, IconName } from 'components';
import { CREATE_MONOMER_TOOL_NAME, KetMonomerClass } from 'ketcher-core';
import Select from '../../../component/form/Select';
import { ChangeEvent, useMemo, useState } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';
import { useDispatch, useSelector } from 'react-redux';
import { editorMonomerCreationStateSelector } from '../../../state/editor/selectors';
import {
  closeMonomerCreationWizard,
  submitMonomerCreation,
} from '../../../state/editor/actions/monomerCreation';
import AttributeField from './components/AttributeField/AttributeField';

type TypeSelectConfigItem = {
  value: KetMonomerClass;
  label: string;
  iconName: IconName;
};

const TypeSelectConfig: TypeSelectConfigItem[] = [
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

const MonomerCreationWizard = () => {
  const dispatch = useDispatch();

  const [type, setType] = useState<KetMonomerClass>();
  const [symbol, setSymbol] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [naturalAnalogue, setNaturalAnalogue] = useState<string>('');

  const onTypeChange = (value) => {
    setType(value);
    setNaturalAnalogue('');
  };

  const onSymbolChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSymbol(event.target.value);
  };

  const onNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const onNaturalAnalogueChange = (value: string) => {
    setNaturalAnalogue(value);
  };

  const displayNaturalAnaloguePicker =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.RNA;

  const typeSelectOptions = useMemo(
    () =>
      TypeSelectConfig.map((option) => ({
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
    setType(undefined);
    setSymbol('');
    setName('');
    setNaturalAnalogue('');
  };

  const handleDiscard = () => {
    dispatch(closeMonomerCreationWizard());
    resetWizard();
  };

  const handleSubmit = () => {
    // TODO: Validate inputs
    dispatch(
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
          <div className={styles.notification}>
            <div className={styles.notificationStrip} />
            <Icon name="checkFilled" className={styles.notificationIcon} />
            <p className={styles.notificationText}>
              Open bonds are replaced with Hydrogen (H), and set as Attachment
              Points by default
            </p>
            <button className={styles.notificationButton}>OK</button>
          </div>
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
                  options={typeSelectOptions}
                  placeholder="Select monomer type"
                  onChange={onTypeChange}
                  value={type}
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
                  onChange={onSymbolChange}
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
                  onChange={onNameChange}
                />
              }
              required
            />
            <AttributeField
              title="Natural analogue"
              control={
                <NaturalAnaloguePicker
                  monomerType={type}
                  onChange={onNaturalAnalogueChange}
                  value={naturalAnalogue}
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
