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

  const [libraryItemDragData, setLibraryItemDragData] =
    useState<LibraryItemDragState>(null);

  const ghostWrapperRef = useRef<HTMLDivElement>(null);
  const animateRef = useRef<number | null>(null);
  const canvasBBoxRef = useRef<DOMRect | null>(null);

  const transform = useZoomTransform();

  useEffect(() => {
    if (!editor) {
      return;
    }

    const handleLibraryItemDrag = (state: LibraryItemDragState) => {
      setLibraryItemDragData(state);
    };

    editor.events.setLibraryItemDragState.add(handleLibraryItemDrag);

    return () => {
      editor.events.setLibraryItemDragState.remove(handleLibraryItemDrag);
    };
  }, [editor]);

  useEffect(() => {
    if (!ZoomTool.instance || !libraryItemDragData) {
      return;
    }

    const canvasWrapper = ZoomTool.instance.canvasWrapper.node();
    if (!canvasWrapper) {
      return;
    }

    canvasBBoxRef.current = canvasWrapper.getBoundingClientRect();
  }, [libraryItemDragData]);
  const leftOffset = editor?.ketcherRootElementBoundingClientRect?.left || 0;
  const topOffset = editor?.ketcherRootElementBoundingClientRect?.top || 0;
  const dragOverCanvas =
    canvasBBoxRef.current &&
    libraryItemDragData &&
    libraryItemDragData.position.x + leftOffset >= canvasBBoxRef.current.left &&
    libraryItemDragData.position.x + leftOffset <=
      canvasBBoxRef.current.right &&
    libraryItemDragData.position.y + topOffset >= canvasBBoxRef.current.top &&
    libraryItemDragData.position.y + topOffset <= canvasBBoxRef.current.bottom;

  useLayoutEffect(() => {
    const element = ghostWrapperRef.current;
    if (!element || !libraryItemDragData) {
      return;
    }

    animateRef.current = requestAnimationFrame(() => {
      const { x, y } = libraryItemDragData.position;

      if (dragOverCanvas && canvasBBoxRef.current) {
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
    <div className={styles.dragGhost} ref={ghostWrapperRef}>
      {isLibraryItemRnaPreset(libraryItemDragData.item) ? (
        <GhostRnaPreset preset={libraryItemDragData.item} />
      ) : (
        <GhostMonomer monomerItem={libraryItemDragData.item} />
      )}
    </div>
  );
};
