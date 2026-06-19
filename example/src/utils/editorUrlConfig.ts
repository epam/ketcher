import { ButtonsConfig } from 'ketcher-react';

export const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(window.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce((acc, button) => {
    if (button) acc[button] = { hidden: true };

    return acc;
  }, {} as { [val: string]: { hidden: boolean } });
};

export const isMacromoleculesEditorDisabled = (): boolean => {
  const searchParams = new URLSearchParams(window.location.search);

  return searchParams.get('disableMacromoleculesEditor') === 'true';
};
