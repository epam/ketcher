import { fromAttachmentGroupDeletion, ketcherProvider } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  AttachmentGroupContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

type Params = ItemEventParams<AttachmentGroupContextMenuProps>;

const useAttachmentGroupDelete = () => {
  const { ketcherId } = useAppContext();

  return useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const attachmentGroupId = props?.attachmentGroupIds?.[0];

      if (
        attachmentGroupId === undefined ||
        !editor.struct().attachmentGroups.has(attachmentGroupId)
      ) {
        return;
      }

      editor.update(
        fromAttachmentGroupDeletion(editor.render.ctab, attachmentGroupId),
      );
      editor.selection(null);
      editor.focusCliparea();
    },
    [ketcherId],
  );
};

export default useAttachmentGroupDelete;
