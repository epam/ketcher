import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  AtomContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';
import { fromAttachmentGroupAddition, ketcherProvider } from 'ketcher-core';
import { isAttachmentGroupCreationSelectionValid } from '../utils';

type Params = ItemEventParams<AtomContextMenuProps>;

export const ATTACHMENT_GROUP_CREATION_DISABLED_TOOLTIP =
  'Selection must contain only continuous atoms without extra elements or bonds';

const useAttachmentGroupCreate = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const atomIds = props?.atomIds ?? [];

      editor.update(fromAttachmentGroupAddition(editor.render.ctab, atomIds));
      editor.selection(null);
    },
    [ketcherId],
  );

  const isDisabled = useCallback(() => {
    const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

    return !isAttachmentGroupCreationSelectionValid(
      editor.struct(),
      editor.selection(),
    );
  }, [ketcherId]);

  return { handler, isDisabled };
};

export default useAttachmentGroupCreate;
