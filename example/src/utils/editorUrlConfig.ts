import { ButtonsConfig } from 'ketcher-react';
import {
  DisabledFunctionalityConfig,
  KetcherFunctionality,
} from 'ketcher-core';

export const getHiddenButtonsConfig = (): ButtonsConfig => {
  const searchParams = new URLSearchParams(globalThis.location.search);
  const hiddenButtons = searchParams.get('hiddenControls');

  if (!hiddenButtons) return {};

  return hiddenButtons.split(',').reduce(
    (acc, button) => {
      if (button) acc[button] = { hidden: true };

      return acc;
    },
    {} as { [val: string]: { hidden: boolean } },
  );
};

export const isMacromoleculesEditorDisabled = (): boolean => {
  const searchParams = new URLSearchParams(globalThis.location.search);

  return searchParams.get('disableMacromoleculesEditor') === 'true';
};

/**
 * Reads the `disabledFunctionality` URL query parameter (comma-separated
 * list of `KetcherFunctionality` values, e.g.
 * `?disabledFunctionality=expandMonomers`) and converts it into a
 * `DisabledFunctionalityConfig` to pass to the `Editor` component.
 * Unknown values are ignored.
 */
export const getDisabledFunctionalityConfig =
  (): DisabledFunctionalityConfig => {
    const searchParams = new URLSearchParams(globalThis.location.search);
    const disabledFunctionality = searchParams.get('disabledFunctionality');

    if (!disabledFunctionality) return [];

    const supportedFunctionality: string[] =
      Object.values(KetcherFunctionality);

    return disabledFunctionality
      .split(',')
      .filter((functionality): functionality is KetcherFunctionality =>
        supportedFunctionality.includes(functionality),
      );
  };
