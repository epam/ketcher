const oneShotDrawingTools = new Set([
  'images',
  'reactionarrow',
  'reactionplus',
  'simpleobject',
  'text',
]);

export function shouldResetToSelect(
  activeTool: string,
  resetOption: boolean | 'paste',
): boolean {
  return (
    resetOption === true ||
    resetOption === activeTool ||
    oneShotDrawingTools.has(activeTool)
  );
}
