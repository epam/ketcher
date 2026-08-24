import { useEffect, useState } from 'react';
import { ZoomTransform } from 'd3';
import { ZoomTool } from 'ketcher-core';
import { selectEditor } from 'state/common';
import { useAppSelector } from './stateHooks';

export const useZoomTransform = () => {
  // ZoomTool.instance is created by the editor, which is set up in an effect of
  // a parent component, so it is still empty when this hook first runs. The
  // editor from the store is what tells us the instance now exists, and it is
  // also what replaces it, so the subscription is (re)established from it.
  const editor = useAppSelector(selectEditor);
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
  }, [editor]);

  return transform;
};
