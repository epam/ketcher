import { CoreEditor } from 'application/editor/internal';
import { SequenceType } from 'domain/entities';
import { RNA_DNA_NON_MODIFIED_PART } from 'domain/constants/monomers';

export function getRnaPartLibraryItem(editor: CoreEditor, rnaBaseName: string) {
  return editor.monomersLibraryGroupedByType.RNA.find(
    (libraryItem) => libraryItem.props.MonomerName === rnaBaseName,
  );
}

export function getPeptideLibraryItem(editor: CoreEditor, peptideName: string) {
  return editor.monomersLibraryGroupedByType.PEPTIDE.find(
    (libraryItem) => libraryItem.props.MonomerName === peptideName,
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
