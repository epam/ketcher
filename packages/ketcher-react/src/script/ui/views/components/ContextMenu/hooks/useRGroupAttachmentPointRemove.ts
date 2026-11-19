import {
  Action,
  fromRGroupAttachmentPointDeletion,
  ketcherProvider,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  ItemEventParameters,
  RGroupAttachmentPointContextMenuProperties,
} from '../contextMenu.types';

type Parameters_ =
  ItemEventParameters<RGroupAttachmentPointContextMenuProperties>;

const useDelete = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const restruct = editor.render.ctab;
      const pointsToDelete = props?.rgroupAttachmentPoints ?? [];

      const action = pointsToDelete.reduce((previousAction, currentPoint) => {
        const currentAction = fromRGroupAttachmentPointDeletion(
          restruct,
          currentPoint,
        );
        return previousAction.mergeWith(currentAction);
      }, new Action());

      editor.update(action);
      editor.selection(null);
    },
    [ketcherId],
  );

  return handler;
};

export default useDelete;
