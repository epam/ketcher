import { IRnaPreset, MonomerOrAmbiguousType } from 'ketcher-core';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import styles from './DragGhost.module.less';
import { GhostRnaPreset } from './svg/GhostRnaPreset';
import { GhostMonomer } from 'components/DragGhost/svg/GhostMonomer';
import { useZoomTransform } from '../../hooks/useZoomTransform';
import {
  LibraryItemDragAction,
  LibraryItemDragState,
} from 'components/monomerLibrary/monomerLibraryItem/hooks/useLibraryItemDrag';

// TODO: Extract this helper
const isRnaPreset = (
  item: IRnaPreset | MonomerOrAmbiguousType,
): item is IRnaPreset => {
  return 'sugar' in item;
};

export const DragGhost = () => {
  const [libraryItemDragData, setLibraryItemDragData] =
    useState<LibraryItemDragState>(null);

  const ghostWrapperRef = useRef<HTMLDivElement>(null);
  const animateRef = useRef<number | null>(null);

  const transform = useZoomTransform();

  useEffect(() => {
    const handleLibraryItemDrag = (event: Event) => {
      const libraryItemDragData = (event as CustomEvent<LibraryItemDragState>)
        .detail;
      setLibraryItemDragData(libraryItemDragData);
    };

    window.addEventListener(LibraryItemDragAction, handleLibraryItemDrag);

    return () => {
      window.removeEventListener(LibraryItemDragAction, handleLibraryItemDrag);
    };
  }, []);

  useLayoutEffect(() => {
    const element = ghostWrapperRef.current;
    if (!element || !libraryItemDragData) {
      return;
    }

    animateRef.current = requestAnimationFrame(() => {
      element.style.transform = `translate(${libraryItemDragData.position.x}px, ${libraryItemDragData.position.y}px) scale(${transform.k})`;
    });

    return () => {
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
        animateRef.current = null;
      }
    };
  }, [libraryItemDragData, transform.k]);

  if (!libraryItemDragData) {
    return null;
  }

  return (
    <div className={styles.dragGhost} ref={ghostWrapperRef}>
      {isRnaPreset(libraryItemDragData.item) ? (
        <GhostRnaPreset preset={libraryItemDragData.item} />
      ) : (
        <GhostMonomer monomerItem={libraryItemDragData.item} />
      )}
    </div>
  );
};
