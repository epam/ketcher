import { IRnaPreset, MonomerOrAmbiguousType } from 'ketcher-core';
import { useLayoutEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { selectLibraryItemDrag } from 'state/common';

import styles from './DragGhost.module.less';
import { GhostRnaPreset } from './svg/GhostRnaPreset';
import { GhostMonomer } from 'components/DragGhost/svg/GhostMonomer';
import { useZoomTransform } from '../../hooks/useZoomTransform';

// TODO: Extract this helper
const isRnaPreset = (
  item: IRnaPreset | MonomerOrAmbiguousType,
): item is IRnaPreset => {
  return 'sugar' in item;
};

export const DragGhost = () => {
  const libraryItemDrag = useSelector(selectLibraryItemDrag);

  const ghostWrapperRef = useRef<HTMLDivElement>(null);
  const animateRef = useRef<number | null>(null);

  const transform = useZoomTransform();

  useLayoutEffect(() => {
    const element = ghostWrapperRef.current;
    if (!element || !libraryItemDrag) {
      return;
    }

    animateRef.current = requestAnimationFrame(() => {
      element.style.transform = `translate(${libraryItemDrag.position.x}px, ${libraryItemDrag.position.y}px) scale(${transform.k})`;
    });

    return () => {
      if (animateRef.current) {
        cancelAnimationFrame(animateRef.current);
        animateRef.current = null;
      }
    };
  }, [libraryItemDrag, transform.k]);

  if (!libraryItemDrag) {
    return null;
  }

  return (
    <div className={styles.dragGhost} ref={ghostWrapperRef}>
      {isRnaPreset(libraryItemDrag.item) ? (
        <GhostRnaPreset preset={libraryItemDrag.item} />
      ) : (
        <GhostMonomer monomerItem={libraryItemDrag.item} />
      )}
    </div>
  );
};
