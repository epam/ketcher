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
 * Per the spec (1.1.4), if a collapsed monomer's abbreviation is deleted the
 * underlying `fromSgroupDeletion` action already expands the monomer atoms
 * before removing the S-group, so no extra step is needed here.
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
