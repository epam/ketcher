import type { ReactNode } from 'react';

import styles from './AttributeField.module.less';
import clsx from 'clsx';

type Properties = {
  title: string;
  titleTestId?: string;
  control: ReactNode;
  required?: boolean;
  disabled?: boolean;
};

const AttributeField = ({
  title,
  titleTestId,
  control,
  required,
  disabled,
}: Properties) => {
  return (
    <div className={styles.field}>
      <p
        className={clsx(styles.fieldTitle, disabled && styles.disabled)}
        data-testid={titleTestId}
      >
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
