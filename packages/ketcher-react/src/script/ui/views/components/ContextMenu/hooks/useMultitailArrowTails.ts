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
} from 'ketcher-core';
import Editor from '../../../../../editor';

type Params = ItemEventParams<MultitailArrowContextMenuProps>;

export const useMultitailArrowTailsAdd = () => {
  const { getKetcherInstance } = useAppContext();

  const addTail = useCallback(
    ({ props }: Params) => {
      const editor = getKetcherInstance().editor;
      const operation = fromMultitailArrowTailAdd(
        editor.render.ctab,
        props?.itemId as number,
      );
      editor.update(operation);
    },
    [getKetcherInstance],
  );

  const isAddTailDisabled = useCallback(
    ({ props }: Params) => {
      const editor = getKetcherInstance().editor as Editor;
      const multitailArrow = editor.render.ctab.molecule.multitailArrows.get(
        props?.itemId as number,
      );
      return (
        multitailArrow &&
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
      editor.update(operation);
    },
    [getKetcherInstance],
  );

  const removeTailHidden = useCallback(({ props }: Params) => {
    return props?.tailId === null;
  }, []);

  return { removeTail, removeTailHidden };
};
