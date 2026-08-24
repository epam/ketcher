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

  // Fragment selection has a dedicated runtime tool, but the public setting
  // keeps the same `select` shape as the other selection modes.
  if (toolName === FRAGMENT_SELECTION_TOOL) {
    return { tool: 'select', opts: FRAGMENT_SELECTION_OPTION };
  }

  return toolName === 'select' ? (tool as PersistedSelectionTool) : undefined;
}

export function restorePersistedSelectionTool(
  tool: PersistedSelectionTool | undefined,
): SelectionToolAction | undefined {
  // Convert the persisted selection option back to the runtime tool expected
  // by the editor action handler.
  if (tool?.tool === 'select' && tool.opts === FRAGMENT_SELECTION_OPTION) {
    return { tool: FRAGMENT_SELECTION_TOOL };
  }

  return tool;
}
