import { Tool } from '../Tool';
import {
  Vec2,
  MultitailArrowReferencePosition,
  Action,
  MULTITAIL_ARROW_KEY,
} from 'ketcher-core';
import { ClosestItemWithMap } from '../../shared/closest.types';

export type ArrowAddTool = Required<
  Pick<Tool, 'mousemove' | 'mouseup' | 'mousedown'>
>;

export type ReactionArrowClosestItem = ClosestItemWithMap<Vec2, 'rxnArrows'>;
export type MultitailArrowClosestItem = ClosestItemWithMap<
  MultitailArrowReferencePosition,
  typeof MULTITAIL_ARROW_KEY
>;

export interface CommonArrowDragContext<CI> {
  originalPosition: Vec2;
  action: Action | null;
  closestItem: CI;
}

export interface ArrowMoveTool<CI> {
  mousedown: (
    event: PointerEvent,
    closestItem: CI,
  ) => CommonArrowDragContext<CI>;
  mousemove: (
    event: PointerEvent,
    dragContext: CommonArrowDragContext<CI>,
  ) => Action;
  mouseup: (
    event: PointerEvent,
    dragContext: CommonArrowDragContext<CI>,
  ) => Action | null;
}
