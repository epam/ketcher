import { Action, fromSgroupDeletion } from 'ketcher-core';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppContext } from 'src/hooks';
import Editor from 'src/script/editor';
import { highlightFG } from 'src/script/ui/state/functionalGroups';
import { ItemEventParams } from '../contextMenu.types';

const useFunctionalGroupRemove = () => {
  const { getKetcherInstance } = useAppContext();
  const dispatch = useDispatch();

  const handler = useCallback(
    ({ props }: ItemEventParams) => {
      const editor = getKetcherInstance().editor as Editor;
      const selectedFunctionalGroups = props?.functionalGroups;
      const action = new Action();

      selectedFunctionalGroups?.forEach((functionalGroup) => {
        action.mergeWith(
          fromSgroupDeletion(
            editor.render.ctab,
            functionalGroup.relatedSGroupId
          )
        );
      });

      editor.update(action);
      highlightFG(dispatch, { group: null, id: null });
    },
    [dispatch, getKetcherInstance]
  );

  return handler;
};

export default useFunctionalGroupRemove;
