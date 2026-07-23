import clsx from 'clsx';

import styles from './NaturalAnalogueChip.module.less';

export type Props = {
  label: string;
  color: string;
  className?: string;
};

const NaturalAnalogueChip = ({ label, color, className }: Props) => {
  return (
    <button className={clsx(styles.chip, className)}>
      <span className={styles.chipLetter}>{label}</span>
      <div className={styles.chipStrip} style={{ backgroundColor: color }} />
    </button>
  );
};

export default NaturalAnalogueChip;
