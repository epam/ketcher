import { ReactNode } from 'react';

import styles from './AttributeField.module.less';
import clsx from 'clsx';

type Props = {
  title: string;
  control: ReactNode;
  required?: boolean;
  disabled?: boolean;
};

const AttributeField = ({ title, control, required, disabled }: Props) => {
  return (
    <div className={styles.field}>
      <p className={clsx(styles.fieldTitle, disabled && styles.disabled)}>
        {title}
        {required && (
          <span className={clsx(styles.required, disabled && styles.disabled)}>
            *
          </span>
        )}
      </p>
      {control}
    </div>
  );
};

export default AttributeField;
