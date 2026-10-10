type Bounds = Pick<DOMRect, 'left' | 'top' | 'right' | 'bottom'>;
type Size = Pick<DOMRect, 'width' | 'height'>;

const GAP = 8;

/** Prefer above the entire attachment point; keep controls reachable at edges. */
export const getPopupPosition = (
  elements: Bounds[],
  size: Size,
  viewport: Bounds,
) => {
  const anchor = {
    left: Math.min(...elements.map((box) => box.left)),
    top: Math.min(...elements.map((box) => box.top)),
    right: Math.max(...elements.map((box) => box.right)),
    bottom: Math.max(...elements.map((box) => box.bottom)),
  };
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(value, max));
  const left = clamp(
    anchor.left,
    viewport.left + GAP,
    viewport.right - size.width - GAP,
  );
  const top = clamp(
    anchor.top,
    viewport.top + GAP,
    viewport.bottom - size.height - GAP,
  );
  const candidates = [
    { left, top: anchor.top - size.height - GAP },
    { left, top: anchor.bottom + GAP },
    { left: anchor.right + GAP, top },
    { left: anchor.left - size.width - GAP, top },
  ];
  return (
    candidates.find(
      (position) =>
        position.left >= viewport.left + GAP &&
        position.top >= viewport.top + GAP &&
        position.left + size.width <= viewport.right - GAP &&
        position.top + size.height <= viewport.bottom - GAP,
    ) ?? { left, top }
  );
};
