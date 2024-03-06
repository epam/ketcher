import { CoreEditor } from 'application/editor';

export function getRnaPartLibraryItem(editor: CoreEditor, rnaBaseName: string) {
  return editor.monomersLibrary.RNA.find(
    (libraryItem) => libraryItem.props.MonomerName === rnaBaseName,
  );
}
