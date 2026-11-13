import {
  Action,
  fromRGroupAttachmentPointDeletion,
  ketcherProvider,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  ItemEventParams,
  RGroupAttachmentPointContextMenuProps,
} from '../contextMenu.types';

type Params = ItemEventParams<RGroupAttachmentPointContextMenuProps>;

const useDelete = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const restruct = editor.render.ctab;
      const pointsToDelete = props?.rgroupAttachmentPoints ?? [];

      let action = new Action();
      pointsToDelete.forEach((currentPoint) => {
        const currentAction = fromRGroupAttachmentPointDeletion(
          restruct,
          currentPoint,
        );
        action = action.mergeWith(currentAction);
      });

      editor.update(action);
      editor.selection(null);
    },
    [ketcherId],
  );

  return handler;
};

export default useDelete;
