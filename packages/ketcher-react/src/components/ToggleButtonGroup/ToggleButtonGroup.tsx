import { ToggleButton } from '@mui/material';
import classes from './ToggleButtonGroup.module.less';
import clsx from 'clsx';
import { useCallback, useState, useMemo } from 'react';

interface ButtonItem<T> {
  label: string;
  value: T;
}

interface ToggleButtonGroupProps<T> {
  buttons: ButtonItem<T>[];
  onClick: (value: T) => void;
  defaultValue: T;
  title?: string;
}

const BUTTON_HEIGHT = 28;
const BUTTON_MARGIN = 2;
const GRID_GAP = 5;
const GRID_COLUMNS = 4;
const SINGLE_BUTTON_WIDTH = 51;
const TWO_BUTTON_GRID_COLUMNS = '51px 74px';

export default function ButtonGroup<T>({
  buttons,
  onClick,
  defaultValue,
  title,
}: ToggleButtonGroupProps<T>) {
  const [value, setValue] = useState(defaultValue);

  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, value: T) => {
      event.stopPropagation();
      onClick(value);
      setValue(value);
    },
    [onClick],
  );

  const isNumericLabel = useCallback((text: string): boolean => {
    const trimmed = (text || '').trim();
    return trimmed !== '' && !isNaN(Number(trimmed));
  }, []);

  const {
    textButtons,
    numericButtons,
    hasNumeric,
    isTwoTextButtons,
    isSingleTextButton,
  } = useMemo(() => {
    const text = buttons.filter(({ label }) => !isNumericLabel(label));
    const numeric = buttons.filter(({ label }) => isNumericLabel(label));

    return {
      textButtons: text,
      numericButtons: numeric,
      hasNumeric: numeric.length > 0,
      isTwoTextButtons: text.length === 2,
      isSingleTextButton: text.length === 1,
    };
  }, [buttons, isNumericLabel]);

  const getContainerStyles = useMemo(
    () => ({
      display:
        hasNumeric && isTwoTextButtons ? ('grid' as const) : ('flex' as const),
      gridTemplateColumns:
        hasNumeric && isTwoTextButtons ? TWO_BUTTON_GRID_COLUMNS : undefined,
      columnGap: hasNumeric && isTwoTextButtons ? BUTTON_MARGIN : undefined,
      rowGap: hasNumeric && isTwoTextButtons ? 0 : undefined,
      flexWrap: hasNumeric && isTwoTextButtons ? undefined : ('wrap' as const),
      flexDirection: hasNumeric ? undefined : ('column' as const),
      gap: !hasNumeric ? GRID_GAP : undefined,
    }),
    [hasNumeric, isTwoTextButtons],
  );

  const getTextButtonStyles = useCallback(
    (_buttonValue: T) => {
      const isGridLayout = hasNumeric && isTwoTextButtons;
      const isMultipleTextButtons =
        hasNumeric && !isTwoTextButtons && !isSingleTextButton;

      return {
        display: 'flex' as const,
        flex: isMultipleTextButtons ? ('1 0 45%' as const) : undefined,
        width:
          hasNumeric && isSingleTextButton
            ? SINGLE_BUTTON_WIDTH
            : isGridLayout
            ? undefined
            : '100%',
        height: BUTTON_HEIGHT,
        margin: isGridLayout ? '0 0 0 0' : 0,
        gap: isGridLayout ? 0 : undefined,
        borderRadius: '4px',
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
    },
    [hasNumeric, isTwoTextButtons, isSingleTextButton],
  );

  const getNumericContainerStyles = useMemo(
    () => ({
      display: 'grid',
      gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${BUTTON_HEIGHT}px)`,
      gap: GRID_GAP,
      marginTop: GRID_GAP,
    }),
    [],
  );

  const getNumericButtonStyles = useMemo(
    () => ({
      display: 'flex' as const,
      boxSizing: 'border-box' as const,
      padding: 0,
      minWidth: 0,
      width: BUTTON_HEIGHT,
      height: BUTTON_HEIGHT,
      margin: 0,
      borderRadius: '4px',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }),
    [],
  );

  const renderTextButtons = () => (
    <div style={getContainerStyles}>
      {textButtons.map(({ label, value: buttonValue }) => (
        <ToggleButton
          data-testid={`${title}-${label}-option`}
          key={label}
          value={Number(buttonValue) || ''}
          onClick={(event) => handleChange(event, buttonValue)}
          className={clsx(classes.button, {
            [classes.selected]: buttonValue === value,
          })}
          style={getTextButtonStyles(buttonValue)}
        >
          {label || 'none'}
        </ToggleButton>
      ))}
    </div>
  );

  const renderNumericButtons = () =>
    numericButtons.length > 0 && (
      <div style={getNumericContainerStyles}>
        {numericButtons.map(({ label, value: buttonValue }) => (
          <ToggleButton
            data-testid={`${title}-${label}-option`}
            key={label}
            value={Number(buttonValue) || ''}
            onClick={(event) => handleChange(event, buttonValue)}
            className={clsx(classes.button, {
              [classes.selected]: buttonValue === value,
            })}
            style={getNumericButtonStyles}
          >
            {label}
          </ToggleButton>
        ))}
      </div>
    );

  return (
    <>
      {renderTextButtons()}
      {renderNumericButtons()}
    </>
  );
}
