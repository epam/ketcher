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

  const [inputOffsetX, handleOffsetX] = useMemo(() => {
    const baseOffset = 40;
    const indents = lineLengthValue / 10 - 1;
    const translateValue =
      baseOffset + indents * 10 + lineLengthValue * 20 + 10;
    return [
      transform.applyX(translateValue) + dragDelta + 6,
      transform.applyX(translateValue) + dragDelta - 14,
    ];
  }, [lineLengthValue, dragDelta, transform]);

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

      const baseOffset = 40;
      const indents = lineLengthValue / 10 - 1;
      const translateValue =
        baseOffset + indents * 10 + lineLengthValue * 20 + 10;
      const finalScreenX = transform.applyX(translateValue + finalDelta);

      const finalWorldX = transform.invertX(finalScreenX);
      const rawCount = (finalWorldX - indents * 10 - baseOffset) / 20;
      const snapped = Math.round(rawCount / 10) * 10;

      updateSettings(snapped);

      setDragDelta(0);
      dragStartX.current = 0;
    },
    [transform, lineLengthValue, updateSettings],
  );

  if (layoutMode === 'flex-layout-mode') {
    return null;
  }

  return (
    <div className={styles.rulerArea}>
      <RulerInput
        lineLengthValue={lineLengthValue}
        onCommitValue={updateSettings}
        offsetX={inputOffsetX}
      />
      <RulerHandle
        offsetX={handleOffsetX}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />
      <RulerScale transform={transform} />
    </div>
  );
};
