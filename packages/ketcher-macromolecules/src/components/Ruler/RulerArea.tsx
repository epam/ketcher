import { useCallback, useEffect, useMemo, useState } from 'react';
import { ZoomTool } from 'ketcher-core';
import { ZoomTransform } from 'd3';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectEditor,
  selectEditorLineLength,
  updateEditorLineLength,
} from 'state/common';
import { useLayoutMode } from 'hooks';

import RulerInput from './RulerInput';
import RulerScale from './RulerScale';

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

  const screenX = useMemo(() => {
    const baseOffset = 40;
    // TODO: Incorrect calculation here
    const indents = lineLengthValue / 10 - 1;
    const translateValue =
      baseOffset + indents * 10 + lineLengthValue * 20 + 10;
    return transform.applyX(translateValue);
  }, [lineLengthValue, transform]);

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

  if (layoutMode === 'flex-layout-mode') {
    return null;
  }

  return (
    <div className={styles.rulerArea}>
      <RulerInput
        lineLengthValue={lineLengthValue}
        onCommitValue={updateSettings}
        offsetX={screenX}
      />
      <RulerScale transform={transform} />
    </div>
  );
};
