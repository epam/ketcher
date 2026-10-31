/**
 * Raphael vertically centers a text element on its anchor: `tuneText` measures the
 * rendered box and writes the resulting shift into the `dy` of the FIRST tspan
 * (see `tuneText` in raphael/dev/raphael.svg.js).
 *
 * For a multi-line element that shift is about half the block height, so the whole
 * block is painted above the anchor — while the model anchors a text box at its top
 * and stacks rows downward. Dropping the shift leaves the first line at the anchor
 * and lets the remaining lines flow down, as the layout expects.
 *
 * Single-line elements keep Raphael's centering, which is the long-standing
 * placement for text labels.
 */
export function removeFirstLineVerticalShift(node: SVGElement): void {
  const tspans = node.getElementsByTagName('tspan');

  if (tspans.length > 1) {
    tspans[0].removeAttribute('dy');
  }
}
