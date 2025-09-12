import { ToggleButton } from '@mui/material';
import classes from './ToggleButtonGroup.module.less';
import clsx from 'clsx';
import { useCallback, useState } from 'react';

export default function ButtonGroup<T>({
  buttons,
  onClick,
  defaultValue,
  title,
}: {
  buttons: { label: string; value: T }[];
  onClick: (value: T) => void;
  defaultValue: T;
  title?: string;
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

  const isNumericLabel = (text: string) => {
    const t = (text || '').trim();
    return t !== '' && !isNaN(Number(t));
  };

  const textButtons = buttons.filter(({ label }) => !isNumericLabel(label));
  const numericButtons = buttons.filter(({ label }) => isNumericLabel(label));

  const hasNumeric = numericButtons.length > 0;
  const isTwoTextButtons = textButtons.length === 2;
  const isSingleTextButton = textButtons.length === 1;

  return (
    <>
      <div
        style={{
          display: hasNumeric && isTwoTextButtons ? 'grid' : 'flex',
          gridTemplateColumns:
            hasNumeric && isTwoTextButtons ? '53px 78px' : undefined,
          columnGap: hasNumeric && isTwoTextButtons ? 2 : undefined,
          rowGap: hasNumeric && isTwoTextButtons ? 0 : undefined,
          flexWrap: hasNumeric && isTwoTextButtons ? undefined : 'wrap',
          flexDirection: hasNumeric ? undefined : 'column',
        }}
      >
        {textButtons.map(({ label, value: buttonValue }) => (
          <ToggleButton
            data-testid={title + '-' + label + '-option'}
            key={label}
            value={Number(buttonValue) || ''}
            onClick={(event) => handleChange(event, buttonValue)}
            className={clsx(classes.button, {
              [classes.selected]: buttonValue === value,
            })}
            style={{
              display: 'flex',
              flex:
                hasNumeric && !isTwoTextButtons && !isSingleTextButton
                  ? '1 0 45%'
                  : undefined,
              width:
                hasNumeric && isSingleTextButton
                  ? 53
                  : hasNumeric && isTwoTextButtons
                  ? undefined
                  : !hasNumeric
                  ? 'calc(100% - 2px)'
                  : '100%',
              height: 28,
              margin:
                hasNumeric && isTwoTextButtons
                  ? '0 0 0 0'
                  : hasNumeric && isSingleTextButton
                  ? 0
                  : '2px',
              gap: hasNumeric && isTwoTextButtons ? 0 : undefined,
              borderRadius: '4px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {label || 'none'}
          </ToggleButton>
        ))}
      </div>

      {numericButtons.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 28px)',
            gap: 4,
            marginTop: 4,
          }}
        >
          {numericButtons.map(({ label, value: buttonValue }) => (
            <ToggleButton
              data-testid={title + '-' + label + '-option'}
              key={label}
              value={Number(buttonValue) || ''}
              onClick={(event) => handleChange(event, buttonValue)}
              className={clsx(classes.button, {
                [classes.selected]: buttonValue === value,
              })}
              style={{
                display: 'flex',
                boxSizing: 'border-box',
                padding: 0,
                minWidth: 0,
                width: 28,
                height: 28,
                margin: 0,
                borderRadius: '4px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {label}
            </ToggleButton>
          ))}
        </div>
      )}
    </>
  );
}
