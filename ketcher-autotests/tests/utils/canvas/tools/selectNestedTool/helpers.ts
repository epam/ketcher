import { Page } from '@playwright/test';
import {
  TYPE_BOND,
  TYPE_SELECT,
  TYPE_TRANSFORM,
  TYPE_REACTION_ARROW,
  TYPE_REACTION,
  TYPE_R_GROUP,
  TYPE_SHAPE,
} from './types';
import {
  BondTool,
  SelectTool,
  RotateTool,
  ArrowTool,
  ReactionMappingTool,
  RgroupTool,
  ShapeTool,
} from './types';

export const openTool = async (
  page: Page,
  defaultToolId: string,
  currentType: string
) => {
  // Selection tool is preselected by default so we do not need to click 2 times
  if (currentType !== TYPE_SELECT) {
    await page.locator(`data-testid=${defaultToolId}`).click();
  }

  await page.locator(`data-testid=${defaultToolId}`).click();
};

export const getToolType = (toolName: string) => {
  let toolTypes: string[] = toolName.split('-');
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
