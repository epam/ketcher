import { RefObject, useEffect } from 'react';
import { D3DragEvent, drag, select } from 'd3';
import { selectEditor } from 'state/common';
import { IRnaPreset, MonomerOrAmbiguousType, ZoomTool } from 'ketcher-core';
import { useSelector } from 'react-redux';

export const useLibraryItemDrag = (
  item: IRnaPreset | MonomerOrAmbiguousType,
  itemRef: RefObject<HTMLElement>,
) => {
  const editor = useSelector(selectEditor);

  useEffect(() => {
    if (!editor || !itemRef.current) {
      return;
    }

    const itemElement = select(itemRef.current);

    const dragBehavior = drag<HTMLElement, unknown>()
      .on('start', null)
      .on('drag', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        if (editor.isLibraryItemDragCancelled) {
          return;
        }

        const { clientX: x, clientY: y } = event.sourceEvent;
        editor.events.setLibraryItemDragState.dispatch({
          item,
          position: { x, y },
        });
      })
      .on('end', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        if (!editor.isLibraryItemDragCancelled) {
          const { clientX: x, clientY: y } = event.sourceEvent;
          const canvasWrapperBoundingClientRect =
            ZoomTool.instance.canvasWrapper.node()?.getBoundingClientRect();
          if (canvasWrapperBoundingClientRect) {
            const { top, left, right, bottom } =
              canvasWrapperBoundingClientRect;
            const transform = ZoomTool.instance.zoomTransform;
            const adjustedX = x - left + transform.k * 15;
            const adjustedY = y - top + transform.k * 15;
            const [scaledX, scaledY] = transform.invert([adjustedX, adjustedY]);
            const mouseWithinCanvas =
              x >= left && x <= right && y >= top && y <= bottom;
            if (mouseWithinCanvas) {
              editor.events.placeLibraryItemOnCanvas.dispatch(item, {
                x: scaledX,
                y: scaledY,
              });
            }
          }
        }

        editor.events.setLibraryItemDragState.dispatch(null);
        editor.isLibraryItemDragCancelled = false;
      });

    itemElement.call(dragBehavior);

    return () => {
      itemElement.on('.drag', null);
    };
  }, [editor, editor?.mode.modeName, item, itemRef]);
};
