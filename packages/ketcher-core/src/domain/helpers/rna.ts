import { CoreEditor } from 'application/editor/internal';
import { AmbiguousMonomer, SequenceType } from 'domain/entities';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';
import { MONOMER_CONST } from 'application/editor';
import { isAmbiguousMonomerLibraryItem } from 'domain/helpers/monomers';
import { KetMonomerClass } from 'application/formatters';

export function getRnaPartLibraryItem(
  editor: CoreEditor,
  rnaBaseName: string,
  monomerClass?: KetMonomerClass,
) {
  return editor.monomersLibrary.find((libraryItem) => {
    if (isAmbiguousMonomerLibraryItem(libraryItem)) {
      if (
        monomerClass &&
        AmbiguousMonomer.getMonomerClass(libraryItem.monomers) !== monomerClass
      ) {
        return false;
      }

      if (libraryItem.label !== rnaBaseName) {
        return false;
      }

      return libraryItem.options.every(
        (option) =>
          option.templateId.includes('Uracil') ||
          !option.templateId.includes('Thymine'),
      );
    }

    return (
      (!monomerClass || libraryItem.props.MonomerClass === monomerClass) &&
      libraryItem.props.MonomerName === rnaBaseName
    );
  });
}

export function getPeptideLibraryItem(editor: CoreEditor, peptideName: string) {
  return editor.monomersLibrary.find(
    (libraryItem) =>
      libraryItem.props.MonomerType === MONOMER_CONST.PEPTIDE &&
      libraryItem.props.MonomerName === peptideName,
  );
}

export function getSugarBySequenceType(sequenceType: SequenceType) {
  switch (sequenceType) {
    case SequenceType.DNA:
      return RNA_DNA_NON_MODIFIED_PART.SUGAR_DNA;
    case SequenceType.RNA:
      return RNA_DNA_NON_MODIFIED_PART.SUGAR_RNA;
    default:
      return undefined;
  }
}
