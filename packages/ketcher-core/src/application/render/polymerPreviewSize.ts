interface PolymerPreviewSizeParams {
  /**
   * Size of the rendered content in canvas units. Must be measured from the
   * rendered structure (atom labels, attachment point chips and so on
   * included), not from the atom coordinates alone.
   */
  contentSizeInUnits: { x: number; y: number };
  /** Canvas units the renderer spends on one angstrom */
  unitsPerAngstrom: number;
  /** Pixels one angstrom takes on the macromolecules canvas (bond length) */
  pxPerAngstrom: number;
  wrapper: Pick<DOMRectReadOnly, 'width' | 'height'>;
}

/**
 * Side (px) of the square svg that shows a structure in polymer mode at the
 * bond length of the macromolecules canvas.
 *
 * The svg is the box the renderer fits the content into, so the content ends
 * up at exactly `pxPerAngstrom` per angstrom only if that box is as large as
 * the content is at that scale. Sizing it from the atom coordinates alone
 * ignores labels, so structures with short bonds and wide labels (for example
 * "R1 - CH3") were squeezed to a fraction of the canvas bond length.
 *
 * Returns undefined when the content does not fit the wrapper, or is empty,
 * meaning the svg should fill the wrapper and the renderer fits to it.
 */
export function getPolymerPreviewSvgSize({
  contentSizeInUnits,
  unitsPerAngstrom,
  pxPerAngstrom,
  wrapper,
}: PolymerPreviewSizeParams): number | undefined {
  const pxPerUnit = pxPerAngstrom / unitsPerAngstrom;
  const widthInPx = contentSizeInUnits.x * pxPerUnit;
  const heightInPx = contentSizeInUnits.y * pxPerUnit;
  const side = Math.max(widthInPx, heightInPx);

  if (!(side > 0)) {
    return undefined;
  }

  const fitsWrapper = widthInPx < wrapper.width && heightInPx < wrapper.height;

  return fitsWrapper
    ? Math.min(side, wrapper.width, wrapper.height)
    : undefined;
}
