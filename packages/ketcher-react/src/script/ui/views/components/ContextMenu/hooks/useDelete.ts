import { fromFragmentDeletion } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import {
  ItemEventParams,
  SelectionContextMenuProps,
} from '../contextMenu.types';

type Params = ItemEventParams<SelectionContextMenuProps>;

const useDelete = () => {
  const { getKetcherInstance } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = getKetcherInstance().editor as Editor;
      const molecule = editor.render.ctab;
      const itemsToDelete = editor.selection() || {
        bonds: props?.bondIds,
        atoms: props?.atomIds,
      };

      const action = fromFragmentDeletion(molecule, itemsToDelete);
      editor.update(action);

      editor.selection(null);
      editor.focusCliparea();
    },
    [getKetcherInstance],
  );

  return handler;
};

export default useDelete;
