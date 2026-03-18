import { useEffect, useState } from 'react';
import { ZoomTransform } from 'd3';
import { ZoomTool } from 'ketcher-core';

export const useZoomTransform = () => {
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

      requestAnimationFrame(() => {
        setTransform(transform);
      });
    };

    zoom.subscribeOnZoomEvent(zoomEventHandler);

    return () => {
      zoom.unsubscribeOnZoomEvent(zoomEventHandler);
    };
    // TODO: Perhaps it's not the best approach, should better rely on some promise/init event
  }, [ZoomTool.instance]);

  return transform;
};
