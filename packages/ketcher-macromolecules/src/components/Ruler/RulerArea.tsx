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
    if (canvasWidth === 0) {
      return [inputPosition, handlePosition];
    }

    const canvasContainer = editor?.canvas.parentElement;
    const scrollLeft = canvasContainer?.scrollLeft || 0;
    const visibleLeftEdge = scrollLeft;
    const visibleRightEdge =
      scrollLeft + (canvasContainer?.clientWidth || canvasWidth);

    // If input would go beyond right visible edge, cap it, take into account input width (35px)
    if (inputPosition + 35 > visibleRightEdge) {
      inputPosition = visibleRightEdge - 35;
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

  const calculateLineLength = useCallback(
    (position: number) => {
      if (layoutMode === 'sequence-layout-mode') {
        const rawCount =
          (position -
            indentsInSequenceMode * SequenceModeIndentWidth -
            SequenceModeStartOffset) /
          SequenceModeItemWidth;
        return Math.max(10, Math.round(rawCount / 10) * 10);
      } else if (layoutMode === 'snake-layout-mode') {
        const rawCount = (position - SnakeModeStartOffset) / SnakeModeItemWidth;
        return Math.max(1, Math.round(rawCount));
      }

      return lineLengthValue;
    },
    [layoutMode, indentsInSequenceMode, lineLengthValue],
  );

  const calculateDragPosition = useCallback(
    (initialScreenX: number) => {
      const dragDelta = initialScreenX - dragStartX.current;
      const screenX = transform.applyX(translateValue) + dragDelta;
      return [dragDelta, transform.invertX(screenX)];
    },
    [transform, translateValue],
  );

  const previewValue = useMemo(() => {
    if (!isDragging) {
      return lineLengthValue;
    }

    const [, dragPosition] = calculateDragPosition(
      dragStartX.current + dragDelta,
    );
    return calculateLineLength(dragPosition);
  }, [
    isDragging,
    lineLengthValue,
    calculateDragPosition,
    dragStartX,
    dragDelta,
    calculateLineLength,
  ]);

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
      const newValue = calculateLineLength(dragPosition);

      if (newValue !== lineLengthValue) {
        updateSettings(newValue);
      }

      setDragDelta(0);
      dragStartX.current = 0;
      editor.events.toggleLineLengthHighlighting.dispatch(false);
    },
    [
      calculateDragPosition,
      calculateLineLength,
      lineLengthValue,
      editor?.events.toggleLineLengthHighlighting,
      updateSettings,
    ],
  );

  if (layoutMode === 'flex-layout-mode') {
    return null;
  }

  // Temporary solution to disable autozoom for the macro editor in e2e tests
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const isRulerVisible = !window._ketcher_isChainLengthRulerDisabled;

  return isRulerVisible ? (
    <div
      className={clsx(styles.rulerArea, isDragging && styles.rulerAreaDragging)}
      data-testid="ruler-area"
    >
      <RulerInput
        lineLengthValue={isDragging ? previewValue : lineLengthValue}
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
      <RulerScale
        transform={transform}
        layoutMode={layoutMode}
        lineLengthValue={lineLengthValue}
      />
    </div>
  ) : null;
};
