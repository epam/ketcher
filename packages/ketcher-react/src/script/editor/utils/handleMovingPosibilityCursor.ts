export const handleMovingPosibilityCursor = (
  item: unknown,
  canvas: SVGElement,
  cursor: string,
) => {
  const isCursorShown = canvas.getAttribute('cursor');
  if (!item && isCursorShown) {
    canvas.removeAttribute('cursor');
  }
  if (item && !isCursorShown) {
    canvas.setAttribute('cursor', cursor);
  }
};
