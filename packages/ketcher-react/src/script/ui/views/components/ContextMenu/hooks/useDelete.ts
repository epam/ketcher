import { fromFragmentDeletion, ketcherProvider } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import { didDeleteWithAttachmentGroupSplitConfirm } from 'src/script/editor/utils/attachmentGroupSplit';
import type {
  ItemEventParameters,
  SelectionContextMenuProperties,
} from '../contextMenu.types';

type Parameters_ = ItemEventParameters<SelectionContextMenuProperties>;

const useDelete = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const itemsToDelete = editor.selection() || {
        bonds: props?.bondIds,
        atoms: props?.atomIds,
      };

      const didDelete = await didDeleteWithAttachmentGroupSplitConfirm(
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
