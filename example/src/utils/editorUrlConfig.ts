import { ButtonsConfig } from 'ketcher-react';

export const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(globalThis.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  const hiddenButtonsConfig: { [val: string]: { hidden: boolean } } = {};
  for (const button of hiddenButtons.split(',')) {
    if (button) hiddenButtonsConfig[button] = { hidden: true };
  }

  return hiddenButtonsConfig;
};

export const isMacromoleculesEditorDisabled = (): boolean => {
  const searchParams = new URLSearchParams(globalThis.location.search);

  return searchParams.get('disableMacromoleculesEditor') === 'true';
};
