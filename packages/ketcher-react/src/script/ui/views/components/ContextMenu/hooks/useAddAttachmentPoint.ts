import {
  Bond,
  fromBondAddition,
  fromSgroupAddition,
  fromSgroupAttachmentPointAddition,
  SGroup,
  SGroupAttachmentPoint,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { AtomContextMenuProps, ItemEventParams } from '../contextMenu.types';
import { isNumber } from 'lodash';

type Params = ItemEventParams<AtomContextMenuProps>;

const useAddAttachmentPoint = () => {
  const { getKetcherInstance } = useAppContext();

  const handler = useCallback(
    async ({ props }: Params) => {
      const editor = getKetcherInstance().editor as Editor;
      const restruct = editor.render.ctab;
      const struct = editor.struct();
      const atomId = props?.atomIds?.[0];
      const sgroup = struct.getGroupFromAtomId(atomId);

      if (!isNumber(atomId)) {
        return;
      }

      const bondAdditionResult = fromBondAddition(
        restruct,
        {
          type: Bond.PATTERN.TYPE.SINGLE,
        },
        atomId,
        {
          label: 'H',
        },
      );
      const action = bondAdditionResult[0];
      const addedLeavingGroupAtomId = bondAdditionResult[2];

      if (!sgroup) {
        const moleculeAtoms = struct.findConnectedComponent(atomId);
        action.mergeWith(
          fromSgroupAddition(
            restruct,
            SGroup.TYPES.SUP,
            moleculeAtoms,
            { expanded: true },
            restruct.molecule.sgroups.newId(),
            [
              new SGroupAttachmentPoint(
                atomId,
                addedLeavingGroupAtomId,
                undefined,
                1,
              ),
            ],
          ),
        );
      } else {
        const sgroupAttachmentPoints = sgroup?.getAttachmentPoints() || [];
        const allPointsNumbers = sgroupAttachmentPoints
          .map((point) => point.attachmentPointNumber || 0)
          .sort();
        let lastMinimalPointNumber =
          allPointsNumbers[allPointsNumbers.length - 1];
        const hasFirstNumber = allPointsNumbers.includes(1);
        if (!hasFirstNumber) {
          lastMinimalPointNumber = 0;
        } else {
          for (let i = 1; i < allPointsNumbers.length; i++) {
            const prevNumber = allPointsNumbers[i - 1];
            const currentNumber = allPointsNumbers[i];
            if (currentNumber > prevNumber + 1) {
              lastMinimalPointNumber = prevNumber;
              break;
            }
          }
        }

        action.mergeWith(
          fromSgroupAttachmentPointAddition(
            restruct,
            sgroup.id,
            new SGroupAttachmentPoint(
              atomId,
              addedLeavingGroupAtomId,
              undefined,
              lastMinimalPointNumber + 1,
            ),
          ),
        );
      }

      editor.update(action);
      editor.selection(null);
      editor.focusCliparea();
    },
    [getKetcherInstance],
  );

  return [handler];
};

export default useAddAttachmentPoint;
