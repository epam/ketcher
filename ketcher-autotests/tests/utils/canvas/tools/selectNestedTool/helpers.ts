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
  SelectToolId,
  toolField,
} from './types';
import { delay, DELAY_IN_SECONDS, SelectionTitle } from '@tests/utils';

export const openTool = async (
  page: Page,
  defaultToolId: string,
  currentType: string,
  isPreselected: boolean,
  lastType?: string,
) => {
  // Selection tool is preselected by default so we do not need to click 2 times
  const defaultTool = await page.getByTestId(defaultToolId);
  if (currentType !== lastType || !isPreselected) {
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

const getActionTypeByToolType = (toolType: toolField) => {
  switch (toolType[1]) {
    case SelectToolId.SELECT_RECTANGLE:
      return SelectionTitle.RectangleSelection;
    case SelectToolId.SELECT_LASSO:
      return SelectionTitle.LassoSelection;
    case SelectToolId.SELECT_FRAGMENT:
      return SelectionTitle.FragmentSelection;
    default:
      throw new Error('wrong tool action');
  }
};

export const getTitleByToolType = (toolType: toolField) => {
  return new RegExp(`(.*)${getActionTypeByToolType(toolType)}(.*)`);
};
