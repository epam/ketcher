import { Action, fromSgroupDeletion, ketcherProvider } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import type Editor from 'src/script/editor';
import type {
  MacromoleculeContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

type Params = ItemEventParams<MacromoleculeContextMenuProps>;

/**
 * Returns a handler that removes the S-group grouping for each monomer in the
 * context (mirrors `useFunctionalGroupRemove` but typed for macromolecule props).
 *
 * Per the spec (1.1.4, #7864), "Remove Grouping" behaves like "Remove
 * Abbreviation": `fromSgroupDeletion` calls
 * `setExpandMonomerSGroup(..., { expanded: true })` internally for
 * `MonomerMicromolecule` s-groups before removing the wrapper, so a
 * still-collapsed monomer is expanded/repositioned (#11312) and its exposed
 * atoms' valence is recomputed (#11314) as part of this single call - no
 * extra step is needed here.
 */
const useRemoveGrouping = () => {
  const { ketcherId } = useAppContext();

  const handler = useCallback(
    ({ props }: Params) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const selectedFunctionalGroups = props?.functionalGroups;
      const action = new Action();

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          fromSgroupDeletion(
            editor.render.ctab,
            functionalGroup.relatedSGroupId,
          ),
        );
      });

      editor.update(action);
    },
    [ketcherId],
  );

  return handler;
};

export default useRemoveGrouping;
