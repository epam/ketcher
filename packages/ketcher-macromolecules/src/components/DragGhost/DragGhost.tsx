import {
  isLibraryItemRnaPreset,
  LibraryItemDragState,
  ZoomTool,
} from 'ketcher-core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './DragGhost.module.less';
import { GhostRnaPreset } from './svg/GhostRnaPreset';
import { GhostMonomer } from 'components/DragGhost/svg/GhostMonomer';
import { useZoomTransform } from '../../hooks/useZoomTransform';
import { useSelector } from 'react-redux';
import { selectEditor } from 'state/common';

export const DragGhost = () => {
  const editor = useSelector(selectEditor);

  const [{ libraryItemDragData, canvasBBox }, setDragState] = useState<{
    libraryItemDragData: LibraryItemDragState;
    canvasBBox: DOMRect | null;
  }>({ libraryItemDragData: null, canvasBBox: null });

  const ghostWrapperRef = useRef<HTMLDivElement>(null);
  const animateRef = useRef<number | null>(null);

  const transform = useZoomTransform();

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleLibraryItemDrag = (state: LibraryItemDragState) => {
      const canvasWrapper = ZoomTool.instance?.canvasWrapper.node();

      setDragState({
        libraryItemDragData: state,
        canvasBBox:
          state && canvasWrapper ? canvasWrapper.getBoundingClientRect() : null,
      });
    };

    editor.events.setLibraryItemDragState.add(handleLibraryItemDrag);

    return () => {
      editor.events.setLibraryItemDragState.remove(handleLibraryItemDrag);
    };
  }, [editor]);

  const leftOffset = editor?.ketcherRootElementBoundingClientRect?.left || 0;
  const topOffset = editor?.ketcherRootElementBoundingClientRect?.top || 0;
  const dragOverCanvas =
    canvasBBox &&
    libraryItemDragData &&
    libraryItemDragData.position.x + leftOffset >= canvasBBox.left &&
    libraryItemDragData.position.x + leftOffset <= canvasBBox.right &&
    libraryItemDragData.position.y + topOffset >= canvasBBox.top &&
    libraryItemDragData.position.y + topOffset <= canvasBBox.bottom;

  useLayoutEffect(() => {
    const element = ghostWrapperRef.current;
    if (!element || !libraryItemDragData) {
      return;
    }

    animateRef.current = requestAnimationFrame(() => {
      const { x, y } = libraryItemDragData.position;

      if (dragOverCanvas) {
        const scale = transform.k;

        element.style.transformOrigin = '0 0';
        element.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      } else {
        element.style.transform = `translate(${x}px, ${y}px)`;
      }
    });

    return () => {
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
        animateRef.current = null;
      }
    };
  }, [dragOverCanvas, libraryItemDragData, transform.k]);

  if (!libraryItemDragData) {
    return null;
  }

  return (
    <div
      className={styles.dragGhost}
      ref={ghostWrapperRef}
      data-testid="drag-ghost"
    >
      {isLibraryItemRnaPreset(libraryItemDragData.item) ? (
        <GhostRnaPreset preset={libraryItemDragData.item} />
      ) : (
        <GhostMonomer monomerItem={libraryItemDragData.item} />
      )}
    </div>
  );
};
