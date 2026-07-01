// Number of visual lines in a rendered text string (Raphael splits on "\n").
export function countTextLines(text: string): number {
  return (text.match(/\n/g)?.length ?? 0) + 1;
}

// Downward (positive-y) offset that moves a vertically-centered multi-line element
// so its FIRST line sits at the anchor instead of the block center. 0 for one line.
export function getMultilineTopAnchorOffset(
  height: number,
  lineCount: number,
): number {
  if (!Number.isFinite(height) || lineCount <= 1) return 0;
  const lineHeight = height / lineCount;
  return (height - lineHeight) / 2;
}
