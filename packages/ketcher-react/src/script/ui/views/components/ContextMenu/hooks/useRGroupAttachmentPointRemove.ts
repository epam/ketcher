import { Action, fromRGroupAttachmentPointDeletion } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { ItemEventParams } from '../contextMenu.types';

const useDelete = () => {
  const { getKetcherInstance } = useAppContext();

  const handler = useCallback(
    async ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const restruct = editor.render.ctab;
      const pointsToDelete = props?.rgroupAttachmentPoints || [];

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
    [getKetcherInstance],
  );

  return handler;
};

export default useDelete;
