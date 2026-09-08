import { IMAGE_KEY, MULTITAIL_ARROW_TOOL_NAME } from 'ketcher-core';

const oneShotDrawingTools = new Set([
  IMAGE_KEY,
  'reactionplus',
  'simpleobject',
  'text',
]);

export function shouldResetToSelect(
  activeTool: string,
  resetOption: boolean | 'paste',
  toolOptions?: string,
): boolean {
  return (
    resetOption === true ||
    resetOption === activeTool ||
    (activeTool === 'reactionarrow' &&
      toolOptions !== MULTITAIL_ARROW_TOOL_NAME) ||
    oneShotDrawingTools.has(activeTool)
  );
}
