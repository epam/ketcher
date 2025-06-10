import { RefObject, useEffect } from 'react';
import { D3DragEvent, drag, select } from 'd3';
import { selectEditor, setLibraryItemDrag } from 'state/common';
import { IRnaPreset, MonomerOrAmbiguousType, ZoomTool } from 'ketcher-core';
import { useLayoutMode } from 'hooks';
import { useDispatch, useSelector } from 'react-redux';

export const useLibraryItemDrag = (
  item: IRnaPreset | MonomerOrAmbiguousType,
  itemRef: RefObject<HTMLElement>,
) => {
  const dispatch = useDispatch();

  const editor = useSelector(selectEditor);

  const layoutMode = useLayoutMode();

  useEffect(() => {
    if (!itemRef.current) {
      return;
    }

    const itemElement = select(itemRef.current);

    const dragBehavior = drag<HTMLElement, unknown>()
      .on('start', null)
      .on('drag', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        const { clientX: x, clientY: y } = event.sourceEvent;

        dispatch(
          setLibraryItemDrag({
            item,
            position: { x, y },
          }),
        );
      })
      .on('end', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        const { clientX: x, clientY: y } = event.sourceEvent;
        const canvasWrapperBoundingClientRect = ZoomTool.instance.canvasWrapper
          .node()
          ?.getBoundingClientRect();
        if (canvasWrapperBoundingClientRect) {
          const { top, left, right, bottom } = canvasWrapperBoundingClientRect;
          const mouseWithinCanvas =
            x >= left && x <= right && y >= top && y <= bottom;
          if (mouseWithinCanvas) {
            editor?.events.placeLibraryItemOnCanvas.dispatch(item, {
              x: x - left,
              y: y - top,
            });
          }
        }

        dispatch(setLibraryItemDrag(null));
      });

    if (layoutMode !== 'sequence-layout-mode') {
      itemElement.call(dragBehavior);
    }

    return () => {
      itemElement.on('.drag', null);
    };
  }, [
    dispatch,
    item,
    editor?.events.placeLibraryItemOnCanvas,
    layoutMode,
    itemRef,
  ]);
};
