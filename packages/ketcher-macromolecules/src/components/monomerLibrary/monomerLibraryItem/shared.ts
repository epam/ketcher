import {
  CoreEditor,
  IRnaPreset,
  libraryItemHasR1AttachmentPoint,
  MonomerOrAmbiguousType,
} from 'ketcher-core';

export const getAutochainErrorMessage = (
  editor: CoreEditor,
  libraryItem: MonomerOrAmbiguousType | IRnaPreset,
): string => {
  const { selectedMonomersWithFreeR2, selectedMonomers } =
    editor.getDataForAutochain();

  if (selectedMonomers.length > 0 && selectedMonomersWithFreeR2.length !== 1) {
    return 'Select a monomer or a chain that has one R2 available.';
  }

  if (
    selectedMonomersWithFreeR2.length === 1 &&
    !libraryItemHasR1AttachmentPoint(libraryItem)
  ) {
    return 'This monomer cannot be added to a chain using this button, as it lacks R1.';
  }

  return '';
};

export const cardMouseOverHandler = (
  editor: CoreEditor,
  libraryItem: MonomerOrAmbiguousType | IRnaPreset,
  setAutochainErrorMessage: (message: string) => void,
) => {
  const errorMessage = getAutochainErrorMessage(editor, libraryItem);
  setAutochainErrorMessage(errorMessage);
};
