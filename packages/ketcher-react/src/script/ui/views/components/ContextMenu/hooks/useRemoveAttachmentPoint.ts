import { Atom, fromOneAtomDeletion } from 'ketcher-core';
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
      const sgroupAttachmentPoints = sgroup?.getAttachmentPoints() || [];
      const atomExternalConnections = Atom.getAttachmentAtomExternalConnections(
        struct,
        atomId,
      );
      const atomFreeAttachmentPoints = sgroupAttachmentPoints?.filter(
        (attachmentPoint) =>
          attachmentPoint.atomId === atomId &&
          !atomExternalConnections?.find(
            (_, bond) =>
              bond.endSuperatomAttachmentPointNumber ===
                attachmentPoint.attachmentPointNumber ||
              bond.beginSuperatomAttachmentPointNumber ===
                attachmentPoint.attachmentPointNumber,
          ),
      );
      const attachmentPointToDelete =
        atomFreeAttachmentPoints[atomFreeAttachmentPoints.length - 1];

      if (!isNumber(atomId) || !attachmentPointToDelete) {
        return;
      }

      const action = fromOneAtomDeletion(
        restruct,
        attachmentPointToDelete.leaveAtomId as number,
      );

      editor.update(action);
      editor.selection(null);
    },
    [getKetcherInstance],
  );

  return [handler];
};

export default useRemoveAttachmentPoint;
