import { useEffect, useState } from 'react';
import { ZoomTransform } from 'd3';
import { selectEditor } from 'state/common';
import { useAppSelector } from './stateHooks';

export const useZoomTransform = () => {
  const editor = useAppSelector(selectEditor);
  const zoomTool = editor?.zoomTool;
  const [transform, setTransform] = useState<ZoomTransform>(
    new ZoomTransform(1, 0, 0),
  );

  useEffect(() => {
    if (!zoomTool) {
      return;
    }

    const zoomEventHandler = (transform: ZoomTransform | undefined) => {
      if (!transform) {
        return;
      }

      requestAnimationFrame(() => {
        setTransform(transform);
      });
    };

    zoomTool.subscribeOnZoomEvent(zoomEventHandler);

    return () => {
      zoomTool.unsubscribeOnZoomEvent(zoomEventHandler);
    };
  }, [zoomTool]);

  return transform;
};
