import { useCallback } from 'react';
import assert from 'assert';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { ItemEventParams } from '../contextMenu.types';
import { editRGroupAttachmentPoint } from 'src/script/editor/tool/apoint.utils';

const useRGroupAttachmentPointEdit = () => {
  const { getKetcherInstance } = useAppContext();

  const handler = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const restruct = editor.render.ctab;
      const atomId = props?.atomIds?.[0];
      assert(atomId != null);
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      editRGroupAttachmentPoint(editor, atom, atomId);
    },
    [getKetcherInstance],
  );

  const disabled = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const restruct = editor.render.ctab;
      const atomId = props?.atomIds?.[0];
      assert(atomId != null);
      const atom = restruct.molecule.atoms.get(atomId);
      assert(atom != null);

      return atom.isRGroupAttachmentPointEditDisabled;
    },
    [getKetcherInstance],
  );

  const hidden = useCallback(({ props }: ItemEventParams) => {
    const atomLength = props?.atomIds?.length || 0;
    return atomLength > 1;
  }, []);

  return [handler, disabled, hidden] as const;
};

export default useRGroupAttachmentPointEdit;
