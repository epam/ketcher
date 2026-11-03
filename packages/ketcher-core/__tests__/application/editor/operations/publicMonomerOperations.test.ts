import * as editorApi from 'application/editor';
import * as operationsApi from 'application/editor/operations';

// The six monomer operations moved to domain/operations, and the two mode
// operations stayed. All eight stay public through application/editor.
const PUBLIC_OPERATION_NAMES = [
  'AttachmentPointHoverOperation',
  'MonomerAddOperation',
  'MonomerDeleteOperation',
  'MonomerHoverOperation',
  'MonomerItemModifyOperation',
  'MonomerMoveOperation',
  'ReinitializeModeOperation',
  'RestoreSequenceCaretPositionOperation',
] as const;

describe('public macromolecule operations', () => {
  it.each(PUBLIC_OPERATION_NAMES)(
    'application/editor exports %s as a class',
    (name) => {
      expect(typeof editorApi[name]).toBe('function');
    },
  );

  it.each(PUBLIC_OPERATION_NAMES)(
    'application/editor/operations exports the same %s',
    (name) => {
      expect(operationsApi[name]).toBe(editorApi[name]);
    },
  );
});
