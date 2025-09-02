import { AttachmentPointName } from 'domain/types';
import styles from './AttachmentPoint.module.less';

type Props = {
  name: AttachmentPointName;
  atomLabel: string;
};

const AttachmentPoint = ({ name, atomLabel }: Props) => {
  return (
    <div className={styles.attachmentPoint}>
      <p className={styles.attachmentPointText}>
        <span className={styles.attachmentPointIndex}>{name}</span>
        &nbsp;({atomLabel})
      </p>
    </div>
  );
};

export default AttachmentPoint;
