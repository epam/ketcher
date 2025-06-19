import { RefObject, useEffect } from 'react';
import { D3DragEvent, drag, select } from 'd3';
import { selectEditor, setLibraryItemDrag } from 'state/common';
import { IRnaPreset, MonomerOrAmbiguousType, ZoomTool } from 'ketcher-core';
import { useDispatch, useSelector } from 'react-redux';

export const useLibraryItemDrag = (
  item: IRnaPreset | MonomerOrAmbiguousType,
  itemRef: RefObject<HTMLElement>,
) => {
  const dispatch = useDispatch();

  const editor = useSelector(selectEditor);

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
          const transform = ZoomTool.instance.zoomTransform;
          const adjustedX = x - left + 15;
          const adjustedY = y - top + 15;
          const [scaledX, scaledY] = transform.invert([adjustedX, adjustedY]);
          const mouseWithinCanvas =
            x >= left && x <= right && y >= top && y <= bottom;
          if (mouseWithinCanvas) {
            editor?.events.placeLibraryItemOnCanvas.dispatch(item, {
              x: scaledX,
              y: scaledY,
            });
          }
        }

        dispatch(setLibraryItemDrag(null));
      });

    if (editor?.mode.modeName !== 'sequence-layout-mode') {
      itemElement.call(dragBehavior);
    }

    return () => {
      itemElement.on('.drag', null);
    };
  }, [
    dispatch,
    item,
    editor?.mode.modeName,
    editor?.events.placeLibraryItemOnCanvas,
    itemRef,
  ]);
};
