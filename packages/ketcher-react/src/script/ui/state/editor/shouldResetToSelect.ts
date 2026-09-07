import { MULTITAIL_ARROW_TOOL_NAME } from 'ketcher-core';

const oneShotDrawingTools = new Set([
  'images',
  'reactionplus',
  'simpleobject',
  'text',
]);

export function shouldResetToSelect(
  activeTool: string,
  resetOption: boolean | 'paste',
  toolOptions?: unknown,
): boolean {
  return (
    resetOption === true ||
    resetOption === activeTool ||
    (activeTool === 'reactionarrow' &&
      toolOptions !== MULTITAIL_ARROW_TOOL_NAME) ||
    oneShotDrawingTools.has(activeTool)
  );
}
