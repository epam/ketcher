import styles from './MonomerCreationWizard.module.less';
import { Icon } from 'components';
import { CREATE_MONOMER_TOOL_NAME } from 'ketcher-core';

const MonomerCreationWizard = () => {
  return (
    <div className={styles.monomerCreationWizard}>
      <div className={styles.leftColumn}>
        <p className={styles.wizardTitle}>
          <Icon name={CREATE_MONOMER_TOOL_NAME} />
          Create Monomer
        </p>
      </div>
      <div className={styles.rightColumn}>
        <div className={styles.attributesWindow}>
          <p className={styles.attributesTitle}>Attributes</p>
          <div className={styles.attributesFields}>
            <div className={styles.field}>
              <p className={styles.fieldTitle}>Type</p>
              <input type="text" className={styles.input} placeholder="CHEM" />
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
          </div>
          <hr />
          <div className={styles.attachmentPoints}></div>
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
