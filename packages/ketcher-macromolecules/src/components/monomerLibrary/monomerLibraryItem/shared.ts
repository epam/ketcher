import {
  CoreEditor,
  IRnaPreset,
  libraryItemHasR1AttachmentPoint,
  MonomerOrAmbiguousType,
} from 'ketcher-core';

export const cardMouseOverHandler = (
  editor: CoreEditor,
  libraryItem: MonomerOrAmbiguousType | IRnaPreset,
  setAutochainErrorMessage: (message: string) => void,
) => {
  setAutochainErrorMessage('');

  const { selectedMonomersWithFreeR2, selectedMonomers } =
    editor.getDataForAutochain();

  if (selectedMonomers.length > 0 && selectedMonomersWithFreeR2.length !== 1) {
    setAutochainErrorMessage(
      'Select a monomer or a chain that has one R2 available.',
    );

    return;
  }

  if (
    selectedMonomersWithFreeR2.length === 1 &&
    !libraryItemHasR1AttachmentPoint(libraryItem)
  ) {
    setAutochainErrorMessage(
      'This monomer cannot be added to a chain using this button, as it lacks R1.',
    );
  }
};
