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

    // Handler to prevent context menu during drag
    const preventContextMenu = (event: MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const dragBehavior = drag<HTMLElement, unknown>()
      .on('start', () => {
        // In sequence layout we do not allow DnD; cancel visual drag early
        editor.isLibraryItemDragCancelled =
          editor.mode.modeName === 'sequence-layout-mode';
        if (!editor.isLibraryItemDragCancelled) {
          document.body.style.cursor = 'grabbing';
          // Prevent context menu during drag
          document.addEventListener('contextmenu', preventContextMenu, true);
        }
      })
      .on('drag', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        if (editor.isLibraryItemDragCancelled) {
          return;
        }

        // Cancel drag on right-click (button 2)
        const mouseEvent = event.sourceEvent as MouseEvent;
        if (mouseEvent.button === 2 || mouseEvent.buttons === 2) {
          editor.cancelLibraryItemDrag();
          document.body.style.cursor = '';
          document.removeEventListener('contextmenu', preventContextMenu, true);
          return;
        }

        const { clientX: x, clientY: y } = event.sourceEvent;
        editor.events.setLibraryItemDragState.dispatch({
          item,
          position: {
            x: x - (editor.ketcherRootElementBoundingClientRect?.left || 0),
            y: y - (editor.ketcherRootElementBoundingClientRect?.top || 0),
          },
        });
      })
      .on('end', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        // Always remove context menu prevention
        document.removeEventListener('contextmenu', preventContextMenu, true);

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
        document.body.style.cursor = '';
      });

    itemElement.call(dragBehavior);

    return () => {
      itemElement.on('.drag', null);
      // Clean up context menu prevention in case component unmounts during drag
      document.removeEventListener('contextmenu', preventContextMenu, true);
    };
  }, [editor, item, itemRef]);
};
