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
 * Keeps the whole panel rectangle inside `bounds`:
 * left >= bounds.left, top >= bounds.top, right <= bounds.right, bottom <= bounds.bottom.
 * The panel is shrunk first when it does not fit, so the position clamp always has a solution.
 */
export function clampRectToBounds(
  rect: PanelRect,
  bounds: PanelBounds,
): PanelRect {
  const width = Math.min(rect.width, bounds.right - bounds.left);
  const height = Math.min(rect.height, bounds.bottom - bounds.top);
  const left = Math.min(Math.max(rect.left, bounds.left), bounds.right - width);
  const top = Math.min(Math.max(rect.top, bounds.top), bounds.bottom - height);

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
}

interface UseSettingsPanelDragResult {
  rect: PanelRect | null;
  setRect: (rect: PanelRect | null) => void;
  isDragging: boolean;
  startDrag: (event: ReactPointerEvent) => void;
  clamp: (bounds?: PanelBounds) => void;
  getBounds: () => PanelBounds | null;
}

export function useSettingsPanelDrag({
  panelRef,
  boundsElement,
}: UseSettingsPanelDragParams): UseSettingsPanelDragResult {
  const [rect, setRect] = useState<PanelRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const getBounds = useCallback((): PanelBounds | null => {
    if (!boundsElement) return null;

    return getBoundsRelativeTo(
      boundsElement,
      panelRef.current?.offsetParent ?? null,
    );
  }, [boundsElement, panelRef]);

  const clamp = useCallback(
    (explicitBounds?: PanelBounds) => {
      const bounds = explicitBounds ?? getBounds();
      if (!bounds) return;

      setRect((current) =>
        current ? clampRectToBounds(current, bounds) : current,
      );
    },
    [getBounds],
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

        setRect(bounds ? clampRectToBounds(moved, bounds) : moved);
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
    [getBounds, panelRef],
  );

  // Pull the panel back inside whenever the bounds element changes size,
  // so shrinking the window or opening the monomer library never strands it.
  useEffect(() => {
    if (!boundsElement || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => clamp());
    observer.observe(boundsElement);

    return () => observer.disconnect();
  }, [boundsElement, clamp]);

  return { rect, setRect, isDragging, startDrag, clamp, getBounds };
}
