import { useCallback } from 'react';
import type {
  ItemEventParameters,
  MultitailArrowContextMenuProperties,
} from '../contextMenu.types';
import { useAppContext } from '../../../../../../hooks';
import {
  type Action,
  fromMultitailArrowTailAdd,
  fromMultitailArrowTailRemove,
  MultitailArrow,
  ketcherProvider,
} from 'ketcher-core';
import type Editor from 'src/script/editor';

type Parameters_ = ItemEventParameters<MultitailArrowContextMenuProperties>;

function updateEditor(editor: unknown, action: Action) {
  // returned Editor type does not match real editor
  const typedEditor = editor as Editor;
  typedEditor.update(action);
  typedEditor.selection(null);
  typedEditor.focusCliparea();
}

export const useMultitailArrowTailsAdd = () => {
  const { ketcherId } = useAppContext();

  const addTail = useCallback(
    ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor;
      const operation = fromMultitailArrowTailAdd(
        editor.render.ctab,
        props?.itemId as number,
      );
      updateEditor(editor, operation);
    },
    [ketcherId],
  );

  const isAddTailDisabled = useCallback(
    ({ props }: Parameters_): boolean => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor as Editor;
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
    [ketcherId],
  );

  return { addTail, isAddTailDisabled };
};

export const useMultitailArrowTailsRemove = () => {
  const { ketcherId } = useAppContext();

  const removeTail = useCallback(
    ({ props }: Parameters_) => {
      const editor = ketcherProvider.getKetcher(ketcherId).editor;
      const operation = fromMultitailArrowTailRemove(
        editor.render.ctab,
        props?.itemId as number,
        props?.tailId as number,
      );
      updateEditor(editor, operation);
    },
    [ketcherId],
  );

  const removeTailHidden = useCallback(({ props }: Parameters_) => {
    return props?.tailId === null;
  }, []);

  return { removeTail, removeTailHidden };
};
