import { Action, ketcherProvider, setExpandMonomerSGroup } from 'ketcher-core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { highlightFG } from 'src/script/ui/state/functionalGroups';
import {
  FunctionalGroupsContextMenuProps,
  ItemEventParams,
} from '../contextMenu.types';

type Params = ItemEventParams<FunctionalGroupsContextMenuProps>;

/**
 * Fullname: useFunctionalGroupExpandOrContract
 */
const useFunctionalGroupEoc = () => {
  const { ketcherId } = useAppContext();
  const dispatch = useDispatch();

  const handler = useCallback(
    ({ props }: Params, toExpand: boolean) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
      const molecule = editor.render.ctab;
      const selectedFunctionalGroups = props?.functionalGroups;
      const action = new Action();

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          setExpandMonomerSGroup(molecule, functionalGroup.relatedSGroupId, {
            expanded: toExpand,
          }),
        );
      });

      editor.update(action);
      editor.rotateController.rerender();
      highlightFG(dispatch, { group: null, id: null });
    },
    [dispatch, ketcherId],
  );

  const hidden = useCallback(({ props }: Params, toExpand: boolean) => {
    // If trying to contract (toExpand is false), hide the option if any functional group has no name
    if (!toExpand) {
      const hasEmptyName = props?.functionalGroups?.some(
        (functionalGroup) => !functionalGroup.name?.trim(),
      );
      if (hasEmptyName) {
        return true;
      }
    }

    return Boolean(
      props?.functionalGroups?.every((functionalGroup) =>
        toExpand ? functionalGroup.isExpanded : !functionalGroup.isExpanded,
      ),
    );
  }, []);

  return [handler, hidden] as const;
};

export default useFunctionalGroupEoc;
