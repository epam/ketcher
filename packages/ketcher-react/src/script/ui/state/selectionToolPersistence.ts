import type { PersistedSelectionTool } from 'ketcher-core';

const FRAGMENT_SELECTION_TOOL = 'fragmentSelection';
const FRAGMENT_SELECTION_OPTION = 'fragment';

type SelectionToolAction = {
  tool: string;
  opts?: unknown;
};

export function normalizeSelectionToolForPersistence(
  tool: unknown,
): PersistedSelectionTool | undefined {
  if (typeof tool !== 'object' || tool === null || !('tool' in tool)) {
    return undefined;
  }

  const toolName = tool.tool;

  if (toolName === FRAGMENT_SELECTION_TOOL) {
    return { tool: 'select', opts: FRAGMENT_SELECTION_OPTION };
  }

  return toolName === 'select' ? (tool as PersistedSelectionTool) : undefined;
}

export function restorePersistedSelectionTool(
  tool: PersistedSelectionTool | undefined,
): SelectionToolAction | undefined {
  if (tool?.tool === 'select' && tool.opts === FRAGMENT_SELECTION_OPTION) {
    return { tool: FRAGMENT_SELECTION_TOOL };
  }

  return tool;
}
