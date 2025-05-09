import { useEffect, useRef } from 'react';
import { ZoomTool } from 'ketcher-core';
import { ZoomTransform } from 'd3';

import styles from './RulerArea.module.less';

export const RulerArea = () => {
  const rulerInputRef = useRef<HTMLInputElement>(null);

  const lineValue = 30;
  const baseOffset = 40;
  const indents = (lineValue % 10) - 1;
  const translateValue = baseOffset + indents * 10 + (lineValue + 1) * 20;

  useEffect(() => {
    if (!ZoomTool.instance) {
      return;
    }

    const zoomEventHandler = (transform: ZoomTransform | undefined) => {
      if (!transform) {
        return;
      }

      const adjustedTranslateValue = transform.k * translateValue + transform.x;

      requestAnimationFrame(() => {
        if (!rulerInputRef?.current) {
          return;
        }

        rulerInputRef.current.style.transform = `translate(${adjustedTranslateValue}px, 0)`;
      });
    };

    ZoomTool.instance?.subscribeOnZoomEvent(zoomEventHandler);
  }, [ZoomTool.instance]);

  return (
    <div className={styles.rulerArea}>
      <input
        className={styles.rulerInput}
        type="text"
        value={lineValue}
        ref={rulerInputRef}
      />
    </div>
  );
};
