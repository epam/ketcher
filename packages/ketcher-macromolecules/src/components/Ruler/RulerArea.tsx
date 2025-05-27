import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZoomTool } from 'ketcher-core';
import { D3DragEvent, ZoomTransform } from 'd3';
import { useSelector } from 'react-redux';
import { selectEditor, selectEditorLineLength } from 'state/common';
import { useLayoutMode } from 'hooks';
import clsx from 'clsx';

import RulerInput from './RulerInput';
import RulerScale from './RulerScale';
import RulerHandle from './RulerHandle';
import {
  SequenceModeIndentWidth,
  SequenceModeItemWidth,
  SequenceModeStartOffset,
  SnakeModeItemWidth,
  SnakeModeStartOffset,
} from './RulerArea.constants';

import styles from './RulerArea.module.less';

export const RulerArea = () => {
  const layoutMode = useLayoutMode();
  const editorLineLength = useSelector(selectEditorLineLength);
  const lineLengthValue = editorLineLength[layoutMode];

  const editor = useSelector(selectEditor);

  const [transform, setTransform] = useState<ZoomTransform>(
    new ZoomTransform(1, 0, 0),
  );

  const dragStartX = useRef(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const indentsInSequenceMode = lineLengthValue / 10 - 1;

  const translateValue = useMemo(() => {
    if (layoutMode === 'sequence-layout-mode') {
      return (
        SequenceModeStartOffset +
        indentsInSequenceMode * SequenceModeIndentWidth +
        lineLengthValue * SequenceModeItemWidth
      );
    } else if (layoutMode === 'snake-layout-mode') {
      return SnakeModeStartOffset + lineLengthValue * SnakeModeItemWidth;
    }

    return 0;
  }, [layoutMode, indentsInSequenceMode, lineLengthValue]);

  const [inputOffsetX, handleOffsetX] = useMemo(() => {
    const translateValueWithZoomAndDrag =
      transform.applyX(translateValue) + dragDelta;
    const handlePosition = translateValueWithZoomAndDrag - 8;
    let inputPosition = translateValueWithZoomAndDrag + 10;

    const canvasWidth = editor?.canvas.width.baseVal.value;
    const canvasContainer = editor?.canvas.parentElement;
    const scrollLeft = canvasContainer?.scrollLeft || 0;
    const visibleLeftEdge = scrollLeft;
    const visibleRightEdge =
      scrollLeft + (canvasContainer?.clientWidth || canvasWidth);

    // If input would go beyond right visible edge, cap it, take into account input width (26px)
    if (inputPosition + 26 > visibleRightEdge) {
      inputPosition = visibleRightEdge - 26;
    }

    // If input would go beyond left visible edge, cap it
    if (inputPosition < visibleLeftEdge) {
      inputPosition = visibleLeftEdge;
    }

    return [inputPosition, handlePosition];
  }, [
    editor?.canvas.width.baseVal.value,
    editor?.canvas.parentElement,
    transform,
    translateValue,
    dragDelta,
  ]);

  const updateSettings = useCallback(
    (value: number) => {
      editor.events.setEditorLineLength.dispatch({ [layoutMode]: value });
    },
    [editor?.events?.setEditorLineLength, layoutMode],
  );

  const calculateDragPosition = useCallback(
    (initialScreenX: number) => {
      const dragDelta = initialScreenX - dragStartX.current;
      const screenX = transform.applyX(translateValue) + dragDelta;
      return [dragDelta, transform.invertX(screenX)];
    },
    [transform, translateValue],
  );

  const handleDragStart = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      setIsDragging(true);
      dragStartX.current = event.sourceEvent.clientX;
      editor.events.toggleLineLengthHighlighting.dispatch(true, translateValue);
    },
    [editor?.events?.toggleLineLengthHighlighting, translateValue],
  );

  const handleDrag = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      const [dragDelta, dragPosition] = calculateDragPosition(
        event.sourceEvent.clientX,
      );
      setDragDelta(dragDelta);
      editor.events.toggleLineLengthHighlighting.dispatch(true, dragPosition);
    },
    [editor?.events?.toggleLineLengthHighlighting, calculateDragPosition],
  );

  const handleDragEnd = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      setIsDragging(false);

      const [, dragPosition] = calculateDragPosition(event.sourceEvent.clientX);

      let newValue = 0;
      if (layoutMode === 'sequence-layout-mode') {
        const rawCount =
          (dragPosition -
            indentsInSequenceMode * SequenceModeIndentWidth -
            SequenceModeStartOffset) /
          SequenceModeItemWidth;
        newValue = Math.max(10, Math.round(rawCount / 10) * 10);
      } else if (layoutMode === 'snake-layout-mode') {
        const rawCount =
          (dragPosition - SnakeModeStartOffset) / SnakeModeItemWidth;
        newValue = Math.max(1, Math.round(rawCount));
      }

      if (newValue !== lineLengthValue) {
        updateSettings(newValue);
      }

      setDragDelta(0);
      dragStartX.current = 0;
      editor.events.toggleLineLengthHighlighting.dispatch(false);
    },
    [
      calculateDragPosition,
      layoutMode,
      indentsInSequenceMode,
      lineLengthValue,
      updateSettings,
      editor?.events?.toggleLineLengthHighlighting,
    ],
  );

  if (layoutMode === 'flex-layout-mode') {
    return null;
  }

  return (
    <div
      className={clsx(styles.rulerArea, isDragging && styles.rulerAreaDragging)}
      data-testid="ruler-area"
    >
      <RulerInput
        lineLengthValue={lineLengthValue}
        offsetX={inputOffsetX}
        isDragging={isDragging}
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
