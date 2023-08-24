import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import classes from './ToggleButtonGroup.module.less';
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { AtomAttributeName } from 'ketcher-core';

type ButtonGroupProps = {
  buttons: { labels: string[]; values: number[] };
  onClick: (key: AtomAttributeName, value: number) => void;
  actualValue: number;
  propertyKey: AtomAttributeName;
};

export default function ButtonGroup({
  buttons: { labels, values },
  onClick,
  actualValue,
  propertyKey,
}: ButtonGroupProps) {
  const [value, setValue] = useState(actualValue);

  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, value: number) => {
      event.stopPropagation();
      onClick(propertyKey, value);
      setValue(value);
    },
    [onClick],
  );

  return (
    <ToggleButtonGroup exclusive>
      {labels.map((label: string, i: number) => (
        <ToggleButton
          key={label}
          value={values[i]}
          onClick={(event) => handleChange(event, values[i])}
          className={clsx(classes.button, {
            [classes.selected]: values[i] === value,
          })}
        >
          {label || 'none'}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
