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
import {
  SequenceModeIndentWidth,
  SequenceModeItemWidth,
  SequenceModeStartOffset,
  SnakeModeItemWidth,
  SnakeModeStartOffset,
} from 'components/Ruler/RulerArea.constants';

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
    return [
      transform.applyX(translateValue) + dragDelta + 10,
      transform.applyX(translateValue) + dragDelta - 8,
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
