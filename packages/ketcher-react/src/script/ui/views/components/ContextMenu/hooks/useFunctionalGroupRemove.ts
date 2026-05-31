import { Action, fromSgroupDeletion, ketcherProvider } from 'ketcher-core';
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

const useFunctionalGroupRemove = () => {
  const { ketcherId } = useAppContext();
  const dispatch = useDispatch();

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
      highlightFG(dispatch, { group: null, id: null });
    },
    [dispatch, ketcherId],
  );

  return handler;
};

export default useFunctionalGroupRemove;
