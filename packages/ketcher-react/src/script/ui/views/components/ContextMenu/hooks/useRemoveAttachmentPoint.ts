import { fromOneAtomDeletion, fromSgroupDeletion } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { ItemEventParams } from '../contextMenu.types';
import { isNumber } from 'lodash';

const useRemoveAttachmentPoint = () => {
  const { getKetcherInstance } = useAppContext();

  const handler = useCallback(
    async ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const restruct = editor.render.ctab;
      const struct = editor.struct();
      const atomId = props?.atomIds?.[0];
      const sgroup = struct.getGroupFromAtomId(atomId);
      const attachmentPoints = sgroup?.getAttachmentPoints() || [];
      const attachmentPoint = attachmentPoints?.find(
        (attachmentPoint) => attachmentPoint.atomId === atomId,
      );

      if (!isNumber(atomId) || !attachmentPoint) {
        return;
      }

      const action = fromOneAtomDeletion(
        restruct,
        attachmentPoint.leaveAtomId as number,
      );

      if (sgroup && attachmentPoints.length === 0) {
        action.mergeWith(fromSgroupDeletion(restruct, sgroup.id));
      }

      editor.update(action);
      editor.selection(null);
    },
    [getKetcherInstance],
  );

  return [handler];
};

export default useRemoveAttachmentPoint;
