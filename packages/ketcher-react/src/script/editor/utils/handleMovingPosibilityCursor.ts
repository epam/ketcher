export const handleMovingPosibilityCursor = (
  item: unknown,
  canvas: SVGElement,
  cursor: string,
) => {
  const isCursorShown = canvas.getAttribute('cursor');
  if (!item && isCursorShown) {
    canvas.removeAttribute('cursor');
  }
  // Previously this code had condition on 'isCursorShown' which prevented different cursor for the same item
  if (item) {
    canvas.setAttribute('cursor', cursor);
  }
};
