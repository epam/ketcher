import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import classes from './ToggleButtonGroup.module.less';
import clsx from 'clsx';
import { useCallback, useState } from 'react';

export default function ButtonGroup<T>({
  buttons,
  onClick,
  defaultValue,
}: {
  buttons: { label: string; value: T }[];
  onClick: (value: T) => void;
  defaultValue: T;
}) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, value: T) => {
      event.stopPropagation();
      onClick(value);
      setValue(value);
    },
    [onClick],
  );

  return (
    <ToggleButtonGroup
      exclusive
      style={{ overflowX: 'hidden', flexWrap: 'wrap' }}
    >
      {buttons.map(({ label, value: buttonValue }) => (
        <ToggleButton
          data-testid={label + '-option'}
          key={label}
          value={Number(buttonValue) || ''}
          onClick={(event) => handleChange(event, buttonValue)}
          className={clsx(classes.button, {
            [classes.selected]: buttonValue === value,
          })}
          style={{ flex: '1 0 25%', margin: '1px' }} // 25% ширины родителя на кнопку так что 4 кнопки займут полную ширину
        >
          {label || 'none'}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
