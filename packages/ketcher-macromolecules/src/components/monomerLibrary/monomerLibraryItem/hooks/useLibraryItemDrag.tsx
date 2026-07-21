import { RefObject, useEffect } from 'react';
import { D3DragEvent, drag, select } from 'd3';
import { selectEditor, setIsDragging } from 'state/common';
import {
  IRnaPreset,
  MonomerOrAmbiguousType,
  ZoomTool,
  BaseMonomer,
  canReplaceMonomer,
  Vec2,
  Coordinates,
} from 'ketcher-core';
import { useDispatch, useSelector } from 'react-redux';

export const useLibraryItemDrag = (
  item: IRnaPreset | MonomerOrAmbiguousType,
  itemRef: RefObject<HTMLElement>,
) => {
  const editor = useSelector(selectEditor);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!editor || !itemRef.current) {
      return;
    }

    const itemElement = select(itemRef.current);

    const dragBehavior = drag<HTMLElement, unknown>()
      .on('start', () => {
        // In sequence layout we do not allow DnD; cancel visual drag early
        editor.isLibraryItemDragCancelled =
          editor.mode.modeName === 'sequence-layout-mode';
        if (!editor.isLibraryItemDragCancelled) {
          document.body.style.cursor = 'grabbing';
        }
      })
      .on('drag', (event: D3DragEvent<HTMLElement, unknown, unknown>) => {
        if (editor.isLibraryItemDragCancelled) {
          return;
        }

        dispatch(setIsDragging(true));

        const { clientX: x, clientY: y } = event.sourceEvent;
        const canvasWrapperBoundingClientRect = ZoomTool.instance.canvasWrapper
          .node()
          ?.getBoundingClientRect();

        let hoveredMonomer: BaseMonomer | null = null;
        let isValidReplacement = false;

        if (canvasWrapperBoundingClientRect) {
          const { top, left } = canvasWrapperBoundingClientRect;
          const transform = ZoomTool.instance.zoomTransform;
          const adjustedX = x - left;
          const adjustedY = y - top;
          const [scaledX, scaledY] = transform.invert([adjustedX, adjustedY]);
          const modelPosition = Coordinates.canvasToModel(
            new Vec2(scaledX, scaledY),
          );

          // Find CLOSEST monomer within 1.5 angstrom radius
          const monomers = Array.from(
            editor.drawingEntitiesManager.monomers.values(),
          );
          const HIT_RADIUS = 0.5; // angstroms
          let closestDistance = Infinity;

          for (const monomer of monomers) {
            // Calculate Euclidean distance between cursor and monomer position
            const distance = Math.sqrt(
              Math.pow(monomer.position.x - modelPosition.x, 2) +
                Math.pow(monomer.position.y - modelPosition.y, 2),
            );
            if (distance < HIT_RADIUS && distance < closestDistance) {
              closestDistance = distance;
              hoveredMonomer = monomer;
              // Validate replacement: check if library item has all active attachment points
              // that the target monomer currently uses for bonds
              if (!Array.isArray(item) && 'label' in item) {
                isValidReplacement = canReplaceMonomer(
                  monomer,
                  item as MonomerOrAmbiguousType,
                );
              }
            }
          }
        }

        editor.events.setLibraryItemDragState.dispatch({
          item,
          position: {
            x: x - (editor.ketcherRootElementBoundingClientRect?.left || 0),
            y: y - (editor.ketcherRootElementBoundingClientRect?.top || 0),
          },
          hoveredMonomer,
          isValidReplacement,
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
            const mouseWithinCanvas =
              x >= left && x <= right && y >= top && y <= bottom;

            if (mouseWithinCanvas) {
              const adjustedX = x - left;
              const adjustedY = y - top;
              const [scaledX, scaledY] = transform.invert([
                adjustedX,
                adjustedY,
              ]);
              const modelPosition = Coordinates.canvasToModel(
                new Vec2(scaledX, scaledY),
              );

              // Find CLOSEST monomer within 1.5 angstrom radius
              let hoveredMonomer: BaseMonomer | null = null;
              const monomers = Array.from(
                editor.drawingEntitiesManager.monomers.values(),
              );
              const HIT_RADIUS = 0.5; // angstroms
              let closestDistance = Infinity;

              for (const monomer of monomers) {
                const distance = Math.sqrt(
                  Math.pow(monomer.position.x - modelPosition.x, 2) +
                    Math.pow(monomer.position.y - modelPosition.y, 2),
                );
                if (distance < HIT_RADIUS && distance < closestDistance) {
                  closestDistance = distance;
                  hoveredMonomer = monomer;
                }
              }

              if (hoveredMonomer && !Array.isArray(item) && 'label' in item) {
                const isValid = canReplaceMonomer(
                  hoveredMonomer,
                  item as MonomerOrAmbiguousType,
                );
                if (isValid) {
                  editor.events.replaceMonomerOnCanvas.dispatch(
                    hoveredMonomer,
                    item as MonomerOrAmbiguousType,
                  );
                }
              } else {
                // Dropping on empty canvas - add new monomer (existing behavior)
                const adjustedXForPlacement = x - left + transform.k * 15;
                const adjustedYForPlacement = y - top + transform.k * 15;
                const [scaledXPlacement, scaledYPlacement] = transform.invert([
                  adjustedXForPlacement,
                  adjustedYForPlacement,
                ]);
                editor.events.placeLibraryItemOnCanvas.dispatch(item, {
                  x: scaledXPlacement,
                  y: scaledYPlacement,
                });
              }
            }
          }
        }

        editor.events.setLibraryItemDragState.dispatch(null);
        editor.isLibraryItemDragCancelled = false;
        document.body.style.cursor = '';
        dispatch(setIsDragging(false));
      });

    itemElement.call(dragBehavior);

    return () => {
      itemElement.on('.drag', null);
    };
  }, [editor, item, itemRef, dispatch]);
};
