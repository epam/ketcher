import type { TFunction } from 'i18next';
import {
  CoreEditor,
  IRnaPreset,
  libraryItemHasR1AttachmentPoint,
  MonomerOrAmbiguousType,
} from 'ketcher-core';

export const getAutochainErrorMessage = (
  editor: CoreEditor,
  libraryItem: MonomerOrAmbiguousType | IRnaPreset,
  t: TFunction,
): string => {
  const { selectedMonomersWithFreeR2, selectedMonomers } =
    editor.getDataForAutochain();

  if (selectedMonomers.length > 0 && selectedMonomersWithFreeR2.length !== 1) {
    return t('monomerLibrary.autochainErrorR2');
  }

  if (
    selectedMonomersWithFreeR2.length === 1 &&
    !libraryItemHasR1AttachmentPoint(libraryItem)
  ) {
    return t('monomerLibrary.autochainErrorR1');
  }

  return '';
};

export const cardMouseOverHandler = (
  editor: CoreEditor,
  libraryItem: MonomerOrAmbiguousType | IRnaPreset,
  setAutochainErrorMessage: (message: string) => void,
  t: TFunction,
) => {
  const errorMessage = getAutochainErrorMessage(editor, libraryItem, t);
  setAutochainErrorMessage(errorMessage);
};
