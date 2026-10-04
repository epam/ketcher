/* eslint-disable react-hooks/refs */
import { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { D3DragEvent } from 'd3';
import { useSelector } from 'react-redux';
import { selectEditor, selectEditorLineLength } from 'state/common';
import { useLayoutMode } from 'hooks';
import clsx from 'clsx';
import type { LayoutMode } from 'ketcher-core';
import { RootSizeContext } from '../../contexts';

import RulerInput from './RulerInput';
import RulerScale from './RulerScale';
import RulerHandle from './RulerHandle';
import {
  RulerHandleOffsetX,
  RulerInputOffsetX,
  RulerInputWidth,
  SequenceModeIndentWidth,
  SequenceModeItemWidth,
  SequenceModeStartOffset,
  SnakeModeItemWidth,
  SnakeModeStartOffset,
} from './RulerArea.constants';

import styles from './RulerArea.module.less';
import { useZoomTransform } from '../../hooks/useZoomTransform';

const getVisibleEdges = (
  canvasContainer: HTMLElement | null | undefined,
  fallbackWidth: number,
) => {
  const visibleWidth = canvasContainer?.clientWidth || fallbackWidth;
  if (!visibleWidth) {
    return null;
  }

  const left = canvasContainer?.scrollLeft || 0;
  return { left, right: left + visibleWidth };
};

const getTranslateValue = (layoutMode: LayoutMode, lineLength: number) => {
  if (layoutMode === 'sequence-layout-mode') {
    const step = 10 * SequenceModeItemWidth + SequenceModeIndentWidth;
    const index = Math.floor(lineLength / 10);
    return SequenceModeStartOffset + index * step;
  }

  if (layoutMode === 'snake-layout-mode') {
    return SnakeModeStartOffset + lineLength * SnakeModeItemWidth;
  }

  return 0;
};

export const RulerArea = () => {
  const layoutMode = useLayoutMode();
  const { width: rootWidth } = useContext(RootSizeContext);
  const editorLineLength = useSelector(selectEditorLineLength);
  const lineLengthValue = editorLineLength[layoutMode];

  const editor = useSelector(selectEditor);

  const canvasContainer = editor?.canvas.parentElement;
  const setEditorLineLength = editor?.events.setEditorLineLength;
  const toggleLineLengthHighlighting =
    editor?.events.toggleLineLengthHighlighting;

  const dragStartX = useRef(0);
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const transform = useZoomTransform();

  const indentsInSequenceMode = lineLengthValue / 10 - 1;

  const translateValue = useMemo(
    () => getTranslateValue(layoutMode, lineLengthValue),
    [layoutMode, lineLengthValue],
  );

  const [inputOffsetX, handleOffsetX] = useMemo(() => {
    const translateValueWithZoomAndDrag =
      transform.applyX(translateValue) + dragDelta;
    const handlePosition = translateValueWithZoomAndDrag + RulerHandleOffsetX;
    let inputPosition = translateValueWithZoomAndDrag + RulerInputOffsetX;

    const visibleEdges = getVisibleEdges(canvasContainer, rootWidth);
    if (!visibleEdges) {
      return [inputPosition, handlePosition];
    }

    // If input would go beyond right visible edge, cap it, take into account input width
    if (inputPosition + RulerInputWidth > visibleEdges.right) {
      inputPosition = visibleEdges.right - RulerInputWidth;
    }

    // If input would go beyond left visible edge, cap it
    if (inputPosition < visibleEdges.left) {
      inputPosition = visibleEdges.left;
    }

    return [inputPosition, handlePosition];
  }, [canvasContainer, rootWidth, transform, translateValue, dragDelta]);

  const updateSettings = useCallback(
    (value: number) => {
      setEditorLineLength?.dispatch({ [layoutMode]: value });
    },
    [setEditorLineLength, layoutMode],
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

      toggleLineLengthHighlighting?.dispatch(true, translateValue);
    },
    [toggleLineLengthHighlighting, translateValue],
  );

  // Scrolls the canvas when the dragged slider would leave the visible area,
  // so it stays on screen and can be grabbed again (decision in #7199).
  // The line length does not depend on the scroll, see calculateDragPosition
  const scrollToKeepHandleVisible = useCallback(
    (sliderTranslateValue: number, dragDelta = 0) => {
      const zoomTool = editor?.zoomTool;
      const visibleEdges = getVisibleEdges(
        editor?.canvas.parentElement,
        rootWidth,
      );
      if (!zoomTool || !visibleEdges) {
        return;
      }

      // The live transform, as the one from useZoomTransform lags behind a scroll
      const liveTransform = zoomTool.zoomTransform;
      const position = liveTransform.applyX(sliderTranslateValue) + dragDelta;
      const rightOvershoot =
        position + RulerInputOffsetX + RulerInputWidth - visibleEdges.right;
      // Never scroll the start of the ruler past the left edge
      const leftOvershoot = Math.min(
        visibleEdges.left - (position + RulerHandleOffsetX),
        visibleEdges.left - liveTransform.applyX(0),
      );

      if (rightOvershoot > 0) {
        zoomTool.scrollBy(-rightOvershoot, 0);
      } else if (leftOvershoot > 0) {
        zoomTool.scrollBy(leftOvershoot, 0);
      }
    },
    [editor?.zoomTool, editor?.canvas.parentElement, rootWidth],
  );

  const handleDrag = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      const [dragDelta, dragPosition] = calculateDragPosition(
        event.sourceEvent.clientX,
      );

      setDragDelta(dragDelta);
      scrollToKeepHandleVisible(translateValue, dragDelta);
      toggleLineLengthHighlighting?.dispatch(true, dragPosition);
    },
    [
      toggleLineLengthHighlighting,
      calculateDragPosition,
      scrollToKeepHandleVisible,
      translateValue,
    ],
  );

  const handleDragEnd = useCallback(
    (event: D3DragEvent<SVGGElement, unknown, unknown>) => {
      setIsDragging(false);

      const [, dragPosition] = calculateDragPosition(event.sourceEvent.clientX);
      const newValue = calculateLineLength(dragPosition);

      if (newValue !== lineLengthValue) {
        updateSettings(newValue);
      }
      // The released slider snaps to the closest allowed value, which can be
      // further than where it was dragged to
      scrollToKeepHandleVisible(getTranslateValue(layoutMode, newValue));

      setDragDelta(0);
      dragStartX.current = 0;

      toggleLineLengthHighlighting?.dispatch(false);
    },
    [
      calculateDragPosition,
      calculateLineLength,
      lineLengthValue,
      toggleLineLengthHighlighting,
      updateSettings,
      scrollToKeepHandleVisible,
      layoutMode,
    ],
  );

  if (layoutMode === 'flex-layout-mode') {
    return null;
  }

  // Temporary solution to disable autozoom for the macro editor in e2e tests
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

      <RulerScale transform={transform} layoutMode={layoutMode} />
    </div>
  ) : null;
};
