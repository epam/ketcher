/****************************************************************************
 * Copyright 2021 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import {
  type PointerEvent as ReactPointerEvent,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface PanelRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface PanelBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/**
 * Keeps the whole panel rectangle inside `bounds`, optionally shrunk by `gutter` on all sides.
 * The panel is shrunk first when it does not fit, so the position clamp always has a solution.
 */
export function clampRectToBounds(
  rect: PanelRect,
  bounds: PanelBounds,
  gutter = 0,
): PanelRect {
  const bLeft = bounds.left + gutter;
  const bTop = bounds.top + gutter;
  const bRight = bounds.right - gutter;
  const bBottom = bounds.bottom - gutter;
  const width = Math.min(rect.width, bRight - bLeft);
  const height = Math.min(rect.height, bBottom - bTop);
  const left = Math.min(Math.max(rect.left, bLeft), bRight - width);
  const top = Math.min(Math.max(rect.top, bTop), bBottom - height);

  return { left, top, width, height };
}

/**
 * The panel is absolutely positioned, so its rect lives in the coordinate space of
 * its offset parent. This converts the bounds element's viewport box into that space.
 */
export function getBoundsRelativeTo(
  boundsElement: HTMLElement,
  offsetParent: Element | null,
): PanelBounds {
  const bounds = boundsElement.getBoundingClientRect();

  if (!offsetParent) {
    return {
      left: bounds.left,
      top: bounds.top,
      right: bounds.right,
      bottom: bounds.bottom,
    };
  }

  const parent = offsetParent.getBoundingClientRect();

  return {
    left: bounds.left - parent.left,
    top: bounds.top - parent.top,
    right: bounds.right - parent.left,
    bottom: bounds.bottom - parent.top,
  };
}

interface UseSettingsPanelDragParams {
  panelRef: RefObject<HTMLElement | null>;
  boundsElement?: HTMLElement | null;
  /** When provided, the left and top edges of the drag bounds are taken from
   *  this element instead of `boundsElement`. Useful when the panel may move
   *  into a wider area on the right/bottom (e.g. the monomers library) while
   *  the left/top must remain constrained by the toolbars. */
  innerBoundsElement?: HTMLElement | null;
  /** Minimum gap between the panel and every edge of the bounds element. */
  gutter?: number;
}

/** Minimum height the user can resize the panel to. */
export const MIN_PANEL_HEIGHT = 325;

interface UseSettingsPanelDragResult {
  rect: PanelRect | null;
  setRect: (rect: PanelRect | null) => void;
  isDragging: boolean;
  startDrag: (event: ReactPointerEvent) => void;
  startResizeTop: (event: ReactPointerEvent) => void;
  startResizeBottom: (event: ReactPointerEvent) => void;
  clamp: (bounds?: PanelBounds) => void;
  getBounds: () => PanelBounds | null;
  /** Record the panel's natural (unconstrained) content height so the panel
   *  can grow back when the window is enlarged after being shrunk. */
  setPreferredHeight: (height: number) => void;
}

export function useSettingsPanelDrag({
  panelRef,
  boundsElement,
  innerBoundsElement,
  gutter = 0,
}: UseSettingsPanelDragParams): UseSettingsPanelDragResult {
  const [rect, setRect] = useState<PanelRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const preferredHeightRef = useRef<number | null>(null);

  const setPreferredHeight = useCallback((height: number) => {
    preferredHeightRef.current = height;
  }, []);

  const getBounds = useCallback((): PanelBounds | null => {
    if (!boundsElement) return null;

    const offsetParent = panelRef.current?.offsetParent ?? null;
    const outer = getBoundsRelativeTo(boundsElement, offsetParent);

    if (!innerBoundsElement) return outer;

    const inner = getBoundsRelativeTo(innerBoundsElement, offsetParent);
    // left/top come from the inner (canvas) area so the panel stays clear of
    // the toolbars; right/bottom come from the outer (layout root) so the
    // panel can be dragged over the monomers library.
    return {
      left: inner.left,
      top: inner.top,
      right: outer.right,
      bottom: outer.bottom,
    };
  }, [boundsElement, innerBoundsElement, panelRef]);

  const clamp = useCallback(
    (explicitBounds?: PanelBounds) => {
      const bounds = explicitBounds ?? getBounds();
      if (!bounds) return;

      setRect((current) =>
        current ? clampRectToBounds(current, bounds, gutter) : current,
      );
    },
    [getBounds, gutter],
  );

  const startDrag = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) return;

      const panel = panelRef.current;
      if (!panel) return;

      event.preventDefault();

      // The panel is absolutely positioned, so its offsets are already in the
      // coordinate space the rect and the clamp bounds use.
      const startRect: PanelRect = {
        left: panel.offsetLeft,
        top: panel.offsetTop,
        width: panel.offsetWidth,
        height: panel.offsetHeight,
      };

      const startX = event.clientX;
      const startY = event.clientY;
      const bounds = getBounds();

      setIsDragging(true);

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const moved: PanelRect = {
          ...startRect,
          left: startRect.left + (moveEvent.clientX - startX),
          top: startRect.top + (moveEvent.clientY - startY),
        };

        setRect(bounds ? clampRectToBounds(moved, bounds, gutter) : moved);
      };

      const onPointerUp = () => {
        setIsDragging(false);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [getBounds, gutter, panelRef],
  );

  // Resize from the bottom edge: top stays fixed, bottom follows the pointer.
  const startResizeBottom = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      const panel = panelRef.current;
      if (!panel) return;

      const panelTop = panel.offsetTop;
      const startHeight = panel.offsetHeight;
      const startY = event.clientY;
      const bounds = getBounds();

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const delta = moveEvent.clientY - startY;
        const bBottom = bounds ? bounds.bottom - gutter : Infinity;
        const newHeight = Math.max(
          MIN_PANEL_HEIGHT,
          Math.min(bBottom - panelTop, startHeight + delta),
        );
        preferredHeightRef.current = newHeight;
        setRect((current) =>
          current ? { ...current, height: newHeight } : current,
        );
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [getBounds, gutter, panelRef],
  );

  // Resize from the top edge: bottom stays fixed, top follows the pointer.
  const startResizeTop = useCallback(
    (event: ReactPointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      event.stopPropagation();

      const panel = panelRef.current;
      if (!panel) return;

      const startTop = panel.offsetTop;
      const startHeight = panel.offsetHeight;
      const startBottom = startTop + startHeight;
      const startY = event.clientY;
      const bounds = getBounds();

      const onPointerMove = (moveEvent: globalThis.PointerEvent) => {
        const delta = moveEvent.clientY - startY;
        const bTop = bounds ? bounds.top + gutter : -Infinity;
        // top is clamped: can't go above bTop, can't make panel shorter than MIN_PANEL_HEIGHT
        const newTop = Math.max(
          bTop,
          Math.min(startBottom - MIN_PANEL_HEIGHT, startTop + delta),
        );
        const newHeight = startBottom - newTop;
        preferredHeightRef.current = newHeight;
        setRect((current) =>
          current ? { ...current, top: newTop, height: newHeight } : current,
        );
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('pointercancel', onPointerUp);
    },
    [getBounds, gutter, panelRef],
  );

  // Pull the panel back inside whenever the bounds element changes size.
  // Uses preferredHeightRef (the natural content height) so the panel can
  // grow back when the window is enlarged after being shrunk.
  useEffect(() => {
    if (!boundsElement || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      const bounds = getBounds();
      if (!bounds) return;

      setRect((current) => {
        if (!current) return current;
        const naturalHeight = preferredHeightRef.current ?? current.height;
        return clampRectToBounds(
          { ...current, height: naturalHeight },
          bounds,
          gutter,
        );
      });
    });
    observer.observe(boundsElement);
    if (innerBoundsElement) observer.observe(innerBoundsElement);

    return () => observer.disconnect();
  }, [boundsElement, innerBoundsElement, getBounds, gutter]);

  return {
    rect,
    setRect,
    isDragging,
    startDrag,
    startResizeTop,
    startResizeBottom,
    clamp,
    getBounds,
    setPreferredHeight,
  };
}
