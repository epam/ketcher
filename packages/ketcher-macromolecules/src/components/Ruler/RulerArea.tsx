import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZoomTool } from 'ketcher-core';
import { D3DragEvent, ZoomTransform } from 'd3';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectEditor,
  selectEditorLineLength,
  updateEditorLineLength,
} from 'state/common';
import { useLayoutMode } from 'hooks';

import RulerInput from './RulerInput';
import RulerScale from './RulerScale';
import RulerHandle from './RulerHandle';

import styles from './RulerArea.module.less';

export const RulerArea = () => {
  const dispatch = useDispatch();

  const layoutMode = useLayoutMode();
  const editorLineLength = useSelector(selectEditorLineLength);
  const lineLengthValue = editorLineLength[layoutMode];

  const editor = useSelector(selectEditor);

  const [transform, setTransform] = useState<ZoomTransform>(
    new ZoomTransform(1, 0, 0),
  );

  const dragStartX = useRef(0);
  const [dragDelta, setDragDelta] = useState(0);

  useEffect(() => {
    const zoom = ZoomTool.instance;
    if (!zoom) {
      return;
    }

    const zoomEventHandler = (transform: ZoomTransform | undefined) => {
      if (!transform) {
        return;
      }

      setTransform(transform);
    };

    zoom.subscribeOnZoomEvent(zoomEventHandler);

    return () => {
      zoom.unsubscribeOnZoomEvent(zoomEventHandler);
    };
    // TODO: Perhaps it's not the best approach, should better rely on some promise/init event
  }, [ZoomTool.instance]);

  const translateValue = useMemo(() => {
    if (layoutMode === 'sequence-layout-mode') {
      const baseOffset = 40;
      const indents = lineLengthValue / 10 - 1;
      return baseOffset + indents * 10 + lineLengthValue * 20 + 10;
    } else if (layoutMode === 'snake-layout-mode') {
      return 25 + lineLengthValue * 60;
    }

    return 0;
  }, [layoutMode, lineLengthValue]);

  const [inputOffsetX, handleOffsetX] = useMemo(() => {
    return [
      transform.applyX(translateValue) + dragDelta + 6,
      transform.applyX(translateValue) + dragDelta - 14,
    ];
  }, [transform, translateValue, dragDelta]);

  const updateSettings = useCallback(
    (value: number) => {
      dispatch(
        updateEditorLineLength({ ...editorLineLength, [layoutMode]: value }),
      );
      editor.events.setEditorLineLength.dispatch();
    },
    [
      dispatch,
      editor?.events?.setEditorLineLength,
      editorLineLength,
      layoutMode,
    ],
  );

  const handleDragStart = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      dragStartX.current = event.sourceEvent.clientX;
    },
    [],
  );

  const handleDrag = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      const dragDelta = event.sourceEvent.clientX - dragStartX.current;
      setDragDelta(dragDelta);
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      const finalDelta = event.sourceEvent.clientX - dragStartX.current;
      const finalScreenX = transform.applyX(translateValue + finalDelta);
      const finalWorldX = transform.invertX(finalScreenX);

      let newValue = 0;
      if (layoutMode === 'sequence-layout-mode') {
        const baseOffset = 40;
        const indents = lineLengthValue / 10 - 1;
        const rawCount = (finalWorldX - indents * 10 - baseOffset) / 20;
        newValue = Math.max(10, Math.round(rawCount / 10) * 10);
      } else if (layoutMode === 'snake-layout-mode') {
        const rawCount = (finalWorldX - 25) / 60;
        newValue = Math.max(1, Math.round(rawCount));
      }

      if (newValue !== lineLengthValue) {
        updateSettings(newValue);
      }

      setDragDelta(0);
      dragStartX.current = 0;
    },
    [transform, translateValue, layoutMode, lineLengthValue, updateSettings],
  );

  if (layoutMode === 'flex-layout-mode') {
    return null;
  }

  return (
    <div className={styles.rulerArea}>
      <RulerInput
        lineLengthValue={lineLengthValue}
        offsetX={inputOffsetX}
        layoutMode={layoutMode}
        onCommitValue={updateSettings}
      />
      <RulerHandle
        offsetX={handleOffsetX}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
      <RulerScale transform={transform} layoutMode={layoutMode} />
    </div>
  );
};
