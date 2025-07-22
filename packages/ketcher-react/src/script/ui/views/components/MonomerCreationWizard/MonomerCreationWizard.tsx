import styles from './MonomerCreationWizard.module.less';
import selectStyles from '../../../component/form/Select/Select.module.less';
import { Icon } from 'components';
import { CREATE_MONOMER_TOOL_NAME, KetMonomerClass } from 'ketcher-core';
import Select from '../../../component/form/Select';
import { useState } from 'react';
import clsx from 'clsx';
import NaturalAnaloguePicker from './components/NaturalAnaloguePicker/NaturalAnaloguePicker';

const TypeSelectConfig = [
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
  const [type, setType] = useState<KetMonomerClass>();
  const onTypeChange = (value) => {
    setType(value);
  };

  const [naturalAnalogue, setNaturalAnalogue] = useState<string>('');
  const onNaturalAnalogueChange = (value: string) => {
    setNaturalAnalogue(value);
  };

  const displayNaturalAnaloguePicker =
    type === KetMonomerClass.AminoAcid ||
    type === KetMonomerClass.Base ||
    type === KetMonomerClass.RNA;

  const typeSelectOptions = TypeSelectConfig.map((option) => ({
    ...option,
    children: (
      <div className={styles.typeOption}>
        <Icon name={option.iconName} />
        {option.label}
      </div>
    ),
  }));

  return (
    <div className={styles.monomerCreationWizard}>
      <div className={styles.leftColumn}>
        <p className={styles.wizardTitle}>
          <Icon name={CREATE_MONOMER_TOOL_NAME} />
          Create Monomer
        </p>
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
            <div className={styles.field}>
              <p className={styles.fieldTitle}>Type</p>
              <Select
                className={styles.input}
                options={typeSelectOptions}
                placeholder="Select monomer type"
                onChange={onTypeChange}
                value={type}
              />
            </div>
            <div className={styles.field}>
              <p className={styles.fieldTitle}>Symbol</p>
              <input
                type="text"
                className={styles.input}
                placeholder="ex.: Azs980uX"
              />
            </div>
            <div className={styles.field}>
              <p className={styles.fieldTitle}>Name</p>
              <input
                type="text"
                className={styles.input}
                placeholder="ex.: 5-hydroxymethyl dC-12"
              />
            </div>
            {displayNaturalAnaloguePicker && (
              <div className={styles.field}>
                <p className={styles.fieldTitle}>Natural analogue*</p>
                <NaturalAnaloguePicker
                  monomerType={type}
                  onChange={onNaturalAnalogueChange}
                  value={naturalAnalogue}
                />
              </div>
            )}
          </div>
          <div className={styles.divider} />
          <div className={styles.attachmentPoints}>
            <p className={styles.fieldTitle}>Attachment points</p>
          </div>
        </div>
        <div className={styles.buttonsContainer}>
          <button className={styles.buttonDiscard}>Discard</button>
          <button className={styles.buttonFinish}>Finish</button>
        </div>
      </div>
    </div>
  );
};

export default MonomerCreationWizard;
