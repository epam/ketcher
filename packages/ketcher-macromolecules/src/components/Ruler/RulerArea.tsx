import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ZoomTool } from 'ketcher-core';
import { ZoomTransform } from 'd3';

import styles from './RulerArea.module.less';
import { useDispatch, useSelector } from 'react-redux';
import { selectEditorLineLength, updateEditorLineLength } from 'state/common';
import { useLayoutMode } from 'hooks';

export const RulerArea = () => {
  const dispatch = useDispatch();

  const layoutMode = useLayoutMode();
  const editorLineLength = useSelector(selectEditorLineLength);

  console.log(editorLineLength);

  const lineLengthValue = editorLineLength[layoutMode];

  console.log(lineLengthValue);

  const rulerInputRef = useRef<HTMLInputElement>(null);

  const [transform, setTransform] = useState<ZoomTransform>(
    new ZoomTransform(1, 0, 0),
  );
  const [inputValue, setInputValue] = useState(lineLengthValue);

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
  }, [ZoomTool.instance]);

  const screenX = useMemo(() => {
    const baseOffset = 40;
    const indents = (lineLengthValue % 10) - 1;
    console.log('indents', indents);
    const translateValue =
      baseOffset + indents * 10 + (lineLengthValue + 1) * 20;
    return transform.applyX(translateValue);
  }, [lineLengthValue, transform]);

  useLayoutEffect(() => {
    const inputElement = rulerInputRef.current;
    if (!inputElement) {
      return;
    }
    inputElement.style.transform = `translateX(${screenX}px)`;
  }, [screenX]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value) {
      dispatch(
        updateEditorLineLength({ 'sequence-layout-mode': Number(value) }),
      );
      setInputValue(value);
    }
  };

  return (
    <div className={styles.rulerArea}>
      <input
        className={styles.rulerInput}
        type="number"
        min="0"
        step="1"
        ref={rulerInputRef}
        onChange={handleChange}
        value={inputValue}
      />
    </div>
  );
};
