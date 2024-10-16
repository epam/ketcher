import { useCallback } from 'react';
import {
  ItemEventParams,
  MultitailArrowContextMenuProps,
} from '../contextMenu.types';
import { useAppContext } from '../../../../../../hooks';
import {
  fromMultitailArrowTailAdd,
  fromMultitailArrowTailRemove,
  MultitailArrow,
  Action,
} from 'ketcher-core';
import Editor from 'src/script/editor';

type Params = ItemEventParams<MultitailArrowContextMenuProps>;

function updateEditor(editor: unknown, action: Action) {
  // returned Editor type does not match real editor
  const typedEditor = editor as Editor;
  typedEditor.update(action);
  typedEditor.selection(null);
  typedEditor.focusCliparea();
}

export const useMultitailArrowTailsAdd = () => {
  const { getKetcherInstance } = useAppContext();

  const addTail = useCallback(
    ({ props }: Params) => {
      const editor = getKetcherInstance().editor;
      const operation = fromMultitailArrowTailAdd(
        editor.render.ctab,
        props?.itemId as number,
      );
      updateEditor(editor, operation);
    },
    [getKetcherInstance],
  );

  const isAddTailDisabled = useCallback(
    ({ props }: Params): boolean => {
      const editor = getKetcherInstance().editor as Editor;
      const multitailArrow = editor.render.ctab.molecule.multitailArrows.get(
        props?.itemId as number,
      );
      return (
        !!multitailArrow &&
        !MultitailArrow.canAddTail(
          multitailArrow.getTailsMaxDistance().distance,
        )
      );
    },
    [getKetcherInstance],
  );

  return { addTail, isAddTailDisabled };
};

export const useMultitailArrowTailsRemove = () => {
  const { getKetcherInstance } = useAppContext();

  const removeTail = useCallback(
    ({ props }: Params) => {
      const editor = getKetcherInstance().editor;
      const operation = fromMultitailArrowTailRemove(
        editor.render.ctab,
        props?.itemId as number,
        props?.tailId as number,
      );
      updateEditor(editor, operation);
    },
    [getKetcherInstance],
  );

  const removeTailHidden = useCallback(({ props }: Params) => {
    return props?.tailId === null;
  }, []);

  return { removeTail, removeTailHidden };
};
