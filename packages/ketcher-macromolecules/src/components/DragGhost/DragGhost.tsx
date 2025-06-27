import {
  isLibraryItemRnaPreset,
  LibraryItemDragEventName,
  ZoomTool,
} from 'ketcher-core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './DragGhost.module.less';
import { GhostRnaPreset } from './svg/GhostRnaPreset';
import { GhostMonomer } from 'components/DragGhost/svg/GhostMonomer';
import { useZoomTransform } from '../../hooks/useZoomTransform';
import { LibraryItemDragState } from 'components/monomerLibrary/monomerLibraryItem/hooks/useLibraryItemDrag';

export const DragGhost = () => {
  const [libraryItemDragData, setLibraryItemDragData] =
    useState<LibraryItemDragState>(null);

  const ghostWrapperRef = useRef<HTMLDivElement>(null);
  const animateRef = useRef<number | null>(null);
  const canvasBBoxRef = useRef<DOMRect | null>(null);

  const transform = useZoomTransform();

  useEffect(() => {
    const handleLibraryItemDrag = (event: Event) => {
      const libraryItemDragData = (event as CustomEvent<LibraryItemDragState>)
        .detail;
      setLibraryItemDragData(libraryItemDragData);
    };

    window.addEventListener(LibraryItemDragEventName, handleLibraryItemDrag);

    return () => {
      window.removeEventListener(
        LibraryItemDragEventName,
        handleLibraryItemDrag,
      );
    };
  }, []);

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

  const dragOverCanvas =
    canvasBBoxRef.current &&
    libraryItemDragData &&
    libraryItemDragData.position.x >= canvasBBoxRef.current.left &&
    libraryItemDragData.position.x <= canvasBBoxRef.current.right &&
    libraryItemDragData.position.y >= canvasBBoxRef.current.top &&
    libraryItemDragData.position.y <= canvasBBoxRef.current.bottom;

  useLayoutEffect(() => {
    const element = ghostWrapperRef.current;
    if (!element || !libraryItemDragData) {
      return;
    }

    animateRef.current = requestAnimationFrame(() => {
      element.style.transform = `translate(${
        libraryItemDragData.position.x
      }px, ${libraryItemDragData.position.y}px) scale(${
        dragOverCanvas ? transform.k : 1
      })`;
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
