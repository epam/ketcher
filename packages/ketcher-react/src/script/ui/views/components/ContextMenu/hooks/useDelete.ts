import { fromFragmentDeletion, ketcherProvider } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
<<<<<<< HEAD
import { deleteWithAttachmentGroupSplitConfirm } from 'src/script/editor/utils/attachmentGroupSplit';
=======
import { didDeleteWithAttachmentGroupSplitConfirm } from 'src/script/editor/utils/attachmentGroupSplit';
>>>>>>> origin/master
import type {
  ItemEventParams,
  SelectionContextMenuProps,
} from '../contextMenu.types';

type Params = ItemEventParams<SelectionContextMenuProps>;

const useDelete = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const itemsToDelete = editor.selection() || {
        bonds: props?.bondIds,
        atoms: props?.atomIds,
      };

<<<<<<< HEAD
      const didDelete = await deleteWithAttachmentGroupSplitConfirm(
=======
      const didDelete = await didDeleteWithAttachmentGroupSplitConfirm(
>>>>>>> origin/master
        editor,
        itemsToDelete,
        () => fromFragmentDeletion(molecule, itemsToDelete),
      );
      if (!didDelete) {
        return;
      }

      editor.selection(null);
      editor.focusCliparea();
    },
    [ketcherId],
  );

  return handler;
};

export default useDelete;
