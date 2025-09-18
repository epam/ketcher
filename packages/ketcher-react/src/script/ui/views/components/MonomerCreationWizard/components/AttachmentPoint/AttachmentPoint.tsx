import { AttachmentPointName } from 'ketcher-core';
import styles from './AttachmentPoint.module.less';

type Props = {
  name: AttachmentPointName;
  atomLabel: string;
  implicitH: number;
};

const AttachmentPoint = ({ name, atomLabel, implicitH }: Props) => {
  return (
    <div className={styles.attachmentPoint}>
      <p className={styles.attachmentPointText}>
        <span className={styles.attachmentPointIndex}>{name}</span>
        &nbsp;
        <span>
          (
          {implicitH > 1 && (
            <>
              H<sub>{implicitH}</sub>
            </>
          )}
          {atomLabel})
        </span>
      </p>
    </div>
  );
};

export default AttachmentPoint;
