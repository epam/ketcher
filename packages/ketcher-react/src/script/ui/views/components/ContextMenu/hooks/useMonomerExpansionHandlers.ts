import {
  type FunctionalGroup,
  Action,
  AmbiguousMonomer,
  MonomerMicromolecule,
  setExpandMonomerSGroup,
  ketcherProvider,
} from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  ItemEventParams,
  MacromoleculeContextMenuProps,
} from '../contextMenu.types';

type Params = ItemEventParams<MacromoleculeContextMenuProps>;

let lastRingContractedPositions: Map<number, { x: number; y: number }> | null =
  null;

export const canExpandMonomer = (functionalGroup: FunctionalGroup) => {
  return (
    functionalGroup.relatedSGroup instanceof MonomerMicromolecule &&
    !(functionalGroup.relatedSGroup.monomer instanceof AmbiguousMonomer) &&
    !functionalGroup.relatedSGroup.monomer.monomerItem.props.unresolved
  );
};

const useMonomerExpansionHandlers = () => {
  const { ketcherId } = useAppContext();

  const action = useCallback(
    ({ props }: Params, toExpand: boolean) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;

      const molecule = editor.render.ctab;
      const selectedFunctionalGroups = props?.functionalGroups;
      const action = new Action();
      const selectedSGroupIds =
        selectedFunctionalGroups
          ?.filter((fg) => canExpandMonomer(fg))
          .map((fg) => fg.relatedSGroupId) ?? [];
      const isMultiMonomerSelection = selectedSGroupIds.length > 1;
      const forceSnapshotMultiCollapse =
        !toExpand &&
        selectedSGroupIds.length <= 1 &&
        !!lastRingContractedPositions &&
        lastRingContractedPositions.size > 1;
      const targetSGroupIds = forceSnapshotMultiCollapse
        ? Array.from(lastRingContractedPositions?.keys() ?? [])
        : selectedSGroupIds;
      const hasCompleteRestoreSnapshot =
        !toExpand &&
        targetSGroupIds.length > 1 &&
        !!lastRingContractedPositions &&
        targetSGroupIds.every((sgid) => lastRingContractedPositions?.has(sgid));

      if (toExpand && isMultiMonomerSelection) {
        const snapshot = new Map<number, { x: number; y: number }>();
        selectedFunctionalGroups?.forEach((fg) => {
          const sgroup = molecule.molecule.sgroups.get(fg.relatedSGroupId);
          if (sgroup?.pp) {
            snapshot.set(fg.relatedSGroupId, {
              x: sgroup.pp.x,
              y: sgroup.pp.y,
            });
          }
        });
        lastRingContractedPositions = snapshot;
      }

      targetSGroupIds.forEach((sgid) => {
        const sgroup = molecule.molecule.sgroups.get(sgid);
        if (!(sgroup instanceof MonomerMicromolecule)) {
          return;
        }

        action.mergeWith(
          setExpandMonomerSGroup(
            molecule,
            sgid,
            {
              expanded: toExpand,
            },
            {
              skipRelocation: hasCompleteRestoreSnapshot,
              forceMonomerCollapseForCycle: hasCompleteRestoreSnapshot,
              restoreContractedPositions:
                hasCompleteRestoreSnapshot && lastRingContractedPositions?.size
                  ? lastRingContractedPositions
                  : undefined,
            },
          ),
        );
      });

      editor.update(action);
      editor.rotateController.rerender();

      if (!toExpand && hasCompleteRestoreSnapshot) {
        lastRingContractedPositions = null;
      }
    },
    [ketcherId],
  );

  const hidden = useCallback(({ props }: Params, toExpand: boolean) => {
    return Boolean(
      props?.functionalGroups?.every((functionalGroup) =>
        toExpand ? functionalGroup.isExpanded : !functionalGroup.isExpanded,
      ),
    );
  }, []);

  return [action, hidden] as const;
};

export default useMonomerExpansionHandlers;
