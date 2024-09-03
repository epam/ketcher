import { Action, setExpandSGroup } from 'ketcher-core';
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
  const { getKetcherInstance } = useAppContext();
  const dispatch = useDispatch();

  const handler = useCallback(
    ({ props }: Params, toExpand: boolean) => {
      const editor = getKetcherInstance().editor as Editor;
      const molecule = editor.render.ctab;
      const selectedFunctionalGroups = props?.functionalGroups;
      const action = new Action();

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          setExpandSGroup(molecule, functionalGroup.relatedSGroupId, {
            expanded: toExpand,
          }),
        );
      });

      editor.update(action);
      editor.rotateController.rerender();
      highlightFG(dispatch, { group: null, id: null });
    },
    [dispatch, getKetcherInstance],
  );

  const hidden = useCallback(({ props }: Params, toExpand: boolean) => {
    return Boolean(
      props?.functionalGroups?.every((functionalGroup) =>
        toExpand ? functionalGroup.isExpanded : !functionalGroup.isExpanded,
      ),
    );
  }, []);
  const disabled = useCallback(({ props }: Params) => {
    const editor = getKetcherInstance().editor as Editor;
    const molecule = editor.render.ctab.molecule;
    return Boolean(
      props?.functionalGroups?.every((functionalGroup) =>
        functionalGroup?.relatedSGroup.isNotContractible(molecule),
      ),
    );
  }, []);

  return [handler, hidden, disabled] as const;
};

export default useFunctionalGroupEoc;
