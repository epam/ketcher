import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import classes from './ToggleButtonGroup.module.less';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { useContextMenu } from 'react-contexify';

const STRICT_TARGET_LABELS = [
  ['Unsaturated', 'Saturated'],
  ['none', 'aromatic', 'aliphatic'],
  ['none', 'anticlockwise', 'clockwise'],
];

export default function ButtonGroup<T>({
  buttons,
  onClick,
  defaultValue,
}: {
  buttons: { label: string; value: T }[];
  onClick: (value: T) => void;
  defaultValue: T;
}) {
  useContextMenu({ id: 'context-menu-id' });

  const [value, setValue] = useState<T>(defaultValue);

  const handleChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newValue: T) => {
      event.stopPropagation();
      onClick(newValue);
      setValue(newValue);
    },
    [onClick],
  );

  const filterTextButtons = (buttons: { label: string; value: T }[]) =>
    buttons.filter(
      ({ label }) => isNaN(Number(label.trim())) || label.trim() === '',
    );

  const filterNumericButtons = (buttons: { label: string; value: T }[]) =>
    buttons.filter(
      ({ label }) => !isNaN(Number(label.trim())) && label.trim() !== '',
    );

  const textButtons = filterTextButtons(buttons);
  const numericButtons = filterNumericButtons(buttons);

  const getButtonClass = (buttonValue: T) =>
    clsx(classes.button, {
      [classes.buttonSpecific]:
        textButtons.length > 0 && numericButtons.length === 0,
      [classes.textButton]: textButtons.some(
        ({ value }) => value === buttonValue,
      ),
      [classes.numericButton]: numericButtons.some(
        ({ value }) => value === buttonValue,
      ),
      [classes.selected]: buttonValue === value,
    });

  const applyStylesToTargetLabelSubmenus = () => {
    const submenus = document.querySelectorAll('.contexify_submenu');
    submenus.forEach((submenu) => {
      const items = Array.from(submenu.querySelectorAll('.MuiButtonBase-root'));
      const itemLabels = items
        .map((item) => item.textContent?.trim())
        .filter((label): label is string => !!label);

      const isTargetSubmenu = STRICT_TARGET_LABELS.some(
        (targetLabels) =>
          targetLabels.length === itemLabels.length &&
          targetLabels.every((label, index) => label === itemLabels[index]),
      );

      if (isTargetSubmenu) {
        const submenuElement = submenu as HTMLElement;
        submenuElement.setAttribute('data-target-label-submenu', 'true');
        submenuElement.style.setProperty('min-width', '0px', 'important');
      }
    });
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          applyStylesToTargetLabelSubmenus();
        }
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [textButtons, numericButtons]);

  useEffect(() => {
    const contextMenuHandler = () => {
      applyStylesToTargetLabelSubmenus();
    };

    document.addEventListener('contextmenu', contextMenuHandler);

    return () => {
      document.removeEventListener('contextmenu', contextMenuHandler);
    };
  }, []);

  return (
    <div
      className={clsx(classes.buttonGroupContainer, {
        [classes.buttonGroupContainerWithNumeric]:
          textButtons.length > 0 && numericButtons.length > 0,
        [classes.buttonGroupContainerOnlyText]:
          textButtons.length > 0 && numericButtons.length === 0,
      })}
      id="context-menu-id"
    >
      <ToggleButtonGroup
        exclusive
        className={clsx(classes.textButtonGroup, {
          [classes.textButtonGroupColumn]:
            textButtons.length > 0 && numericButtons.length === 0,
          [classes.textButtonGroupRow]: numericButtons.length > 0,
        })}
        value={value}
        onChange={(_, newValue) => newValue !== null && setValue(newValue)}
      >
        {textButtons.map(({ label, value: buttonValue }) => (
          <ToggleButton
            data-testid={label + '-option'}
            key={label || 'empty'}
            value={buttonValue ?? ''}
            onClick={(event) =>
              buttonValue !== undefined && handleChange(event, buttonValue)
            }
            className={getButtonClass(buttonValue)}
            style={{ margin: '3px', borderRadius: '3px' }}
          >
            {label || 'none'}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <div className={classes.numericButtonsContainer}>
        {numericButtons.map(({ label, value: buttonValue }) => (
          <ToggleButton
            data-testid={label + '-option'}
            key={label}
            value={buttonValue ?? ''}
            onClick={(event) =>
              buttonValue !== undefined && handleChange(event, buttonValue)
            }
            className={getButtonClass(buttonValue)}
          >
            {label}
          </ToggleButton>
        ))}
      </div>
    </div>
  );
}
