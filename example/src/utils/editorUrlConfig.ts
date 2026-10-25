import { ButtonsConfig } from 'ketcher-react';

export const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParameters = new URLSearchParams(globalThis.location.search);
  const hiddenButtons = searchParameters.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce(
    (accumulator, button) => {
      if (button) accumulator[button] = { hidden: true };

      return accumulator;
    },
    {} as { [val: string]: { hidden: boolean } },
  );
};

export const isMacromoleculesEditorDisabled = (): boolean => {
  const searchParameters = new URLSearchParams(globalThis.location.search);

  return searchParameters.get('disableMacromoleculesEditor') === 'true';
};
