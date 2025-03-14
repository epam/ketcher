import { CoreEditor } from 'application/editor/internal';
import { AmbiguousMonomer, SequenceType } from 'domain/entities';
import {
  MONOMER_CONST,
  RNA_DNA_NON_MODIFIED_PART,
  RnaDnaBaseNames,
} from 'domain/constants/monomers';
import { isAmbiguousMonomerLibraryItem } from 'domain/helpers/monomers';
import { KetMonomerClass } from 'application/formatters';

export function getRnaPartLibraryItem(
  editor: CoreEditor,
  libraryItemLabel: string,
  monomerClass?: KetMonomerClass,
  isDna = false,
) {
  return editor.monomersLibrary.find((libraryItem) => {
    if (isAmbiguousMonomerLibraryItem(libraryItem)) {
      if (
        monomerClass &&
        AmbiguousMonomer.getMonomerClass(libraryItem.monomers) !== monomerClass
      ) {
        return false;
      }

      if (libraryItem.label !== libraryItemLabel) {
        return false;
      }

      return libraryItem.options.some((option) =>
        isDna
          ? option.templateId.includes(RnaDnaBaseNames.THYMINE)
          : option.templateId.includes(RnaDnaBaseNames.URACIL),
      );
    }

    return (
      (!monomerClass || libraryItem.props.MonomerClass === monomerClass) &&
      libraryItem.props.MonomerName === libraryItemLabel
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
