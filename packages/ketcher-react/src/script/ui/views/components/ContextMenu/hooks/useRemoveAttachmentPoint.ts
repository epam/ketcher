import { Atom, fromOneAtomDeletion, ketcherProvider } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { AtomContextMenuProps, ItemEventParams } from '../contextMenu.types';
import { isNumber } from 'lodash';

type Params = ItemEventParams<AtomContextMenuProps>;

const useRemoveAttachmentPoint = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
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
      editor.focusCliparea();
    },
    [ketcherId],
  );

  return [handler];
};

export default useRemoveAttachmentPoint;
