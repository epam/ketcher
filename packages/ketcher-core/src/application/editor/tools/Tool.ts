import { MonomerItemType, Entities } from 'domain/types';
import { IKetMonomerGroupTemplate } from 'application/formatters';

interface ToolEventHandler {
  click?(event: Event): void;

  dblclick?(event: Event): void;

  mousedown?(event: Event): void;

  mousemove?(event: Event): void;

  mouseup?(event: Event): void;

  mouseleave?(event: Event): void;

  mouseLeaveClientArea?(event: Event): void;

  mouseover?(event: Event): void;

  mouseOverPolymerBond?(event: Event): void;

  mouseLeavePolymerBond?(event: Event): void;

  mouseOverMonomer?(event: Event): void;

  mouseOverAttachmentPoint?(event: Event): void;

  mouseLeaveAttachmentPoint?(event: Event): void;

  mouseUpAttachmentPoint?(event: Event): void;

  mouseDownAttachmentPoint?(event: Event): void;

  mouseOnMoveMonomer?(event: Event): void;

  mouseLeaveMonomer?(event: Event): void;

  mouseOverDrawingEntity?(event: Event): void;

  mouseLeaveDrawingEntity?(event: Event): void;

  mouseUpMonomer?(event: Event): void;

  rightClickSequence?(event: Event): void;

  rightClickCanvas?(event: Event): void;

  rightClickPolymerBond?(event: Event): void;

  editSequence?(): void;

  startNewSequence?(): void;

  turnOnSequenceEditInRNABuilderMode?(): void;

  turnOffSequenceEditInRNABuilderMode?(): void;

  modifySequenceInRnaBuilder?(): void;

  mouseOverSequenceItem?(event: Event): void;

  mouseOnMoveSequenceItem?(event: Event): void;

  mouseLeaveSequenceItem?(event: Event): void;

  changeSequenceTypeEnterMode?(event: Event): void;

  toggleSequenceEditMode?(event: Event): void;

  toggleSequenceEditInRNABuilderMode?(event: Event): void;

  clickOnSequenceItem?(event: Event): void;

  mousedownBetweenSequenceItems?(event: Event): void;

  mouseDownOnSequenceItem?(event: Event): void;

  doubleClickOnSequenceItem?(event: Event): void;
}

export interface IRnaPreset {
  name?: string;
  nameInList?: string;
  base?: MonomerItemType;
  sugar?: MonomerItemType;
  phosphate?: MonomerItemType;
  default?: boolean;
  favorite?: boolean;
  editedName?: boolean;
}

export interface IRnaLabeledPreset
  extends Omit<IRnaPreset, 'base' | 'sugar' | 'phosphate'>,
    Pick<IKetMonomerGroupTemplate, 'templates'> {}

export type LabeledNodesWithPositionInSequence = {
  type: Entities;
  nodeIndexOverall: number;
  baseLabel?: string;
  sugarLabel?: string;
  phosphateLabel?: string;
  isNucleosideConnectedAndSelectedWithPhosphate?: boolean;
  hasR1Connection?: boolean;
};

export interface Tool extends ToolEventHandler {
  cancel?(): void;

  isSelectionRunning?(): boolean;

  isNotActiveTool?: boolean;
}

export interface BaseTool extends Tool {
  destroy(): void;
}

export type PeptideToolOptions = MonomerItemType;

// export type ToolOptions = MonomerItemType;
// !todo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ToolOptions = any;
export type ToolConstructorInterface = {
  new (editor, ...args: ToolOptions[]): Tool | BaseTool;
};

export type ToolEventHandlerName = keyof ToolEventHandler;

export function isBaseTool(
  tool: Tool | BaseTool | undefined,
): tool is BaseTool {
  return (tool as BaseTool)?.destroy !== undefined;
}
