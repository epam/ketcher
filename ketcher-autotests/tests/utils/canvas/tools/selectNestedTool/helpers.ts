import { Page } from '@playwright/test';
import {
  TYPE_BOND,
  TYPE_SELECT,
  TYPE_TRANSFORM,
  TYPE_REACTION_ARROW,
  TYPE_REACTION,
  TYPE_R_GROUP,
  TYPE_SHAPE,
  BondTool,
  SelectTool,
  RotateTool,
  ArrowTool,
  ReactionMappingTool,
  RgroupTool,
  ShapeTool,
} from './types';
import { delay, DELAY_IN_SECONDS } from '@tests/utils';

export const openTool = async (
  page: Page,
  defaultToolId: string,
  currentType: string,
  lastType?: string,
) => {
  // Selection tool is preselected by default so we do not need to click 2 times
  const defaultTool = await page.getByTestId(defaultToolId);
  lastType = lastType || TYPE_SELECT;
  if (currentType !== lastType) {
    await defaultTool.click();
    await delay(DELAY_IN_SECONDS.ONE);
  }

  await defaultTool.click();
};

export const getToolType = (toolName: string) => {
  const toolTypes: string[] = toolName.split('-');
  let toolType = null;

  if (`${toolTypes[0]}${toolTypes[1]}` === TYPE_REACTION_ARROW) {
    toolType = TYPE_REACTION_ARROW;
  } else {
    toolType = toolTypes[0];
  }

  switch (toolType) {
    case TYPE_BOND:
      toolType = BondTool;
      break;
    case TYPE_SELECT:
      toolType = SelectTool;
      break;
    case TYPE_TRANSFORM:
      toolType = RotateTool;
      break;
    case TYPE_REACTION_ARROW:
      toolType = ArrowTool;
      break;
    case TYPE_REACTION:
      toolType = ReactionMappingTool;
      break;
    case TYPE_R_GROUP:
      toolType = RgroupTool;
      break;
    case TYPE_SHAPE:
      toolType = ShapeTool;
      break;
  }

  return toolType;
};
