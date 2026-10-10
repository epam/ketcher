import {
  type CoreEditor,
  type IKetMonomerGroupTemplate,
  type MonomerItemType,
  setMonomerTemplatePrefix,
} from 'ketcher-core';
import { type IRnaPreset } from 'components/monomerLibrary/RnaBuilder/types';
import { getMonomerUniqueKey } from 'state/library';

export const DELETE_CONFIRMATION = {
  onCanvas: {
    title: 'Monomer present on canvas',
    confirmationText:
      'Deleting the monomer will not delete the instances of the monomer present on canvas. Do you wish to proceed?',
  },
  inPreset: {
    title: 'Monomer participates in a preset',
    confirmationText:
      'This monomer participates in a preset. Deleting it will delete the library presets it participates in. Do you wish to proceed?',
  },
  onCanvasAndInPreset: {
    title: 'Monomer present on canvas and participates in a preset',
    confirmationText:
      'Deleting the monomer will not delete the instances of the monomer present on canvas, but will delete all library presets it participates in. Do you wish to proceed?',
  },
};

/**
 * Removes the monomer from the library together with every preset that
 * references it, keeping the KET library data and the Redux custom presets
 * (and their localStorage cache) in sync.
 */
export const deleteMonomerWithPresets = (
  editor: CoreEditor,
  monomer: MonomerItemType,
  referencingPresets: IKetMonomerGroupTemplate[],
  customPresets: IRnaPreset[],
  deleteCustomPreset: (preset: IRnaPreset) => void,
) => {
  const parsedJson = editor.monomersLibraryParsedJson;

  referencingPresets.forEach((presetTemplate) => {
    const presetRef = parsedJson?.root.templates.find(
      ({ $ref }) => parsedJson[$ref] === presetTemplate,
    )?.$ref;
    if (presetRef) {
      editor.removePresetFromLibrary(presetRef);
    }

    const customPreset = customPresets.find(
      (preset) => preset.name === presetTemplate.name,
    );
    if (customPreset) {
      deleteCustomPreset(customPreset);
    }
  });

  editor.removeMonomerFromLibrary(monomer);
};

/**
 * Custom RNA presets (created in the RNA Builder) are stored in Redux state
 * and localStorage, NOT in `_monomersLibraryParsedJson`. This function checks
 * those presets so the delete confirmation covers them too.
 */
export const getReferencingCustomPresets = (
  monomer: MonomerItemType,
  customPresets: IRnaPreset[],
): IRnaPreset[] => {
  const ref = setMonomerTemplatePrefix(
    monomer.props.id || getMonomerUniqueKey(monomer),
  );
  return customPresets.filter((preset) =>
    [preset.sugar, preset.base, preset.phosphate].some((component) => {
      if (!component) return false;
      return (
        setMonomerTemplatePrefix(
          component.props.id || getMonomerUniqueKey(component),
        ) === ref
      );
    }),
  );
};

export const getDeleteConfirmation = (
  isOnCanvas: boolean,
  hasReferencingPresets: boolean,
) => {
  if (isOnCanvas && hasReferencingPresets) {
    return DELETE_CONFIRMATION.onCanvasAndInPreset;
  }
  if (isOnCanvas) return DELETE_CONFIRMATION.onCanvas;
  if (hasReferencingPresets) return DELETE_CONFIRMATION.inPreset;
  return null;
};
