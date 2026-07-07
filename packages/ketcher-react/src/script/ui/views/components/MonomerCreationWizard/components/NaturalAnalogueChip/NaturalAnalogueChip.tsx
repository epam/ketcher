import clsx from 'clsx';

import styles from './NaturalAnalogueChip.module.less';

export type Props = {
  label: string;
  color: string;
  className?: string;
  testId?: string;
};

const NaturalAnalogueChip = ({ label, color, className, testId }: Props) => {
  return (
    <button className={clsx(styles.chip, className)} data-testid={testId}>
      <span className={styles.chipLetter}>{label}</span>
      <div className={styles.chipStrip} style={{ backgroundColor: color }} />
    </button>
  );
};

export default NaturalAnalogueChip;
