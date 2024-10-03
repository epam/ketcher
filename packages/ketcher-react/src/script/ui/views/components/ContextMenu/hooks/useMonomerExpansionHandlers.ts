import { Action, setExpandMonomerSGroup } from 'ketcher-core';
import { useCallback } from 'react';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import {
  ItemEventParams,
  MacromoleculeContextMenuProps,
} from '../contextMenu.types';

type Params = ItemEventParams<MacromoleculeContextMenuProps>;

const useMonomerExpansionHandlers = () => {
  const { getKetcherInstance } = useAppContext();

  const action = useCallback(
    ({ props }: Params, toExpand: boolean) => {
      const editor = getKetcherInstance().editor as Editor;

      const molecule = editor.render.ctab;
      const selectedFunctionalGroups = props?.functionalGroups;
      const action = new Action();

      selectedFunctionalGroups?.forEach((fg) => {
        action.mergeWith(
          setExpandMonomerSGroup(molecule, fg.relatedSGroupId, {
            expanded: toExpand,
          }),
        );
      });

      editor.update(action);
      editor.rotateController.rerender();
      editor.selection({
        sgroups: selectedFunctionalGroups?.map((fg) => fg.relatedSGroup),
      });
    },
    [getKetcherInstance],
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
