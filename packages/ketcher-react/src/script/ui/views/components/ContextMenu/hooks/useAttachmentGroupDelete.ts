import {
  fromOneAtomDeletion,
  isSuperAttachmentPointById,
  ketcherProvider,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  AtomContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

type Params = ItemEventParams<AtomContextMenuProps>;

const useAttachmentGroupDelete = () => {
  const { ketcherId } = useAppContext();

  return useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const attachmentGroupId = props?.atomIds?.[0];

      if (
        attachmentGroupId === undefined ||
        !isSuperAttachmentPointById(editor.struct(), attachmentGroupId)
      ) {
        return;
      }

      editor.update(fromOneAtomDeletion(editor.render.ctab, attachmentGroupId));
      editor.selection(null);
      editor.focusCliparea();
    },
    [ketcherId],
  );
};

export default useAttachmentGroupDelete;
